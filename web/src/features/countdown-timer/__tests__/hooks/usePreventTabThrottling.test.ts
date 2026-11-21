import { renderHook } from "@testing-library/react";

const mocks = vi.hoisted(() => ({
  oscillator: {
    start: vi.fn(),
    stop: vi.fn(),
    disconnect: vi.fn(),
    frequency: { value: 0 },
    connect: vi.fn(),
  },
  gainNode: {
    gain: { value: 0 },
    connect: vi.fn(),
    disconnect: vi.fn(),
  },
  useTimerRunning: false,
  audioContextCreated: false,
}));

vi.mock("@/features/countdown-timer/stores/countdown-store", () => ({
  useTimerRunning: () => mocks.useTimerRunning,
}));

// Mock Web Audio API with a class that acts as a constructor
class MockAudioContext {
  createOscillator = () => {
    return mocks.oscillator;
  };
  createGain = () => {
    return mocks.gainNode;
  };
  close = vi.fn();
  destination = {};

  constructor() {
    mocks.audioContextCreated = true;
  }
}

Object.defineProperty(window, "AudioContext", {
  value: MockAudioContext,
  writable: true,
});

import usePreventTabThrottling from "@/features/countdown-timer/hooks/usePreventTabThrottling";

describe("usePreventTabThrottling", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.useTimerRunning = false;
    mocks.audioContextCreated = false;
    mocks.oscillator.frequency.value = 0;
    mocks.gainNode.gain.value = 0;
  });

  it("should not create audio context when timer is not running", () => {
    mocks.useTimerRunning = false;

    renderHook(() => usePreventTabThrottling());

    expect(mocks.audioContextCreated).toBe(false);
    expect(mocks.oscillator.start).not.toHaveBeenCalled();
  });

  it("should create and start audio context when timer is running", () => {
    mocks.useTimerRunning = true;

    renderHook(() => usePreventTabThrottling());

    expect(mocks.audioContextCreated).toBe(true);
    expect(mocks.oscillator.start).toHaveBeenCalled();
  });

  it("should set the gain to a nearly silent volume", () => {
    mocks.useTimerRunning = true;

    renderHook(() => usePreventTabThrottling());

    expect(mocks.gainNode.gain.value).toBe(0.001);
  });

  it("should set the oscillator frequency to 220 Hz", () => {
    mocks.useTimerRunning = true;

    renderHook(() => usePreventTabThrottling());

    expect(mocks.oscillator.frequency.value).toBe(220);
  });

  it("should connect oscillator to gain node and destination", () => {
    mocks.useTimerRunning = true;

    renderHook(() => usePreventTabThrottling());

    expect(mocks.oscillator.connect).toHaveBeenCalledWith(mocks.gainNode);
    expect(mocks.gainNode.connect).toHaveBeenCalled();
  });

  it("should stop and clean up audio when timer stops", () => {
    mocks.useTimerRunning = true;

    const { rerender } = renderHook(() => usePreventTabThrottling());

    expect(mocks.oscillator.start).toHaveBeenCalled();

    mocks.useTimerRunning = false;
    rerender();

    expect(mocks.oscillator.stop).toHaveBeenCalled();
    expect(mocks.oscillator.disconnect).toHaveBeenCalled();
    expect(mocks.gainNode.disconnect).toHaveBeenCalled();
  });

  it("should clean up on unmount", () => {
    mocks.useTimerRunning = true;

    const { unmount } = renderHook(() => usePreventTabThrottling());

    unmount();

    expect(mocks.oscillator.stop).toHaveBeenCalled();
    expect(mocks.oscillator.disconnect).toHaveBeenCalled();
    expect(mocks.gainNode.disconnect).toHaveBeenCalled();
  });

  it("should handle cleanup errors gracefully", () => {
    mocks.useTimerRunning = true;

    mocks.oscillator.stop.mockImplementation(() => {
      throw new Error("Cleanup error");
    });

    const { unmount } = renderHook(() => usePreventTabThrottling());

    // Should not throw
    expect(() => unmount()).not.toThrow();
  });

  it("should close the audio context on cleanup", () => {
    mocks.useTimerRunning = true;

    const { unmount } = renderHook(() => usePreventTabThrottling());

    unmount();

    expect(mocks.oscillator.stop).toHaveBeenCalled();
  });

  it("should handle webkitAudioContext fallback when AudioContext is unavailable", () => {
    mocks.useTimerRunning = true;

    // Temporarily remove standard AudioContext and provide webkit fallback
    const StandardAudioContext = window.AudioContext;
    // @ts-expect-error - intentionally setting to undefined for test
    window.AudioContext = undefined;
    // @ts-expect-error - webkit prefix fallback
    window.webkitAudioContext = MockAudioContext;

    renderHook(() => usePreventTabThrottling());

    expect(mocks.audioContextCreated).toBe(true);
    expect(mocks.oscillator.start).toHaveBeenCalled();

    // Restore
    window.AudioContext = StandardAudioContext;
    // @ts-expect-error - cleaning up webkit fallback
    delete window.webkitAudioContext;
  });

  it("should create a new audio context when timer restarts after stopping", () => {
    mocks.useTimerRunning = true;

    const { rerender } = renderHook(() => usePreventTabThrottling());

    const firstStartCallCount = mocks.oscillator.start.mock.calls.length;
    expect(firstStartCallCount).toBe(1);

    // Stop the timer
    mocks.useTimerRunning = false;
    rerender();

    expect(mocks.oscillator.stop).toHaveBeenCalled();

    // Clear mocks to track new calls
    mocks.oscillator.start.mockClear();

    // Restart the timer
    mocks.useTimerRunning = true;
    rerender();

    // Should create a new audio context and start again
    expect(mocks.audioContextCreated).toBe(true);
    expect(mocks.oscillator.start).toHaveBeenCalled();
  });

  it("should handle errors during audio context creation gracefully", () => {
    mocks.useTimerRunning = true;

    // Make AudioContext throw during construction
    const OriginalAudioContext = window.AudioContext;
    // @ts-expect-error - setting to a function that throws
    window.AudioContext = function () {
      throw new Error("AudioContext not supported");
    };

    // Should not throw during render
    expect(() => renderHook(() => usePreventTabThrottling())).toThrow(
      "AudioContext not supported",
    );

    // Restore
    window.AudioContext = OriginalAudioContext;
  });

  it("should handle errors during oscillator disconnect gracefully", () => {
    mocks.useTimerRunning = true;

    mocks.oscillator.disconnect.mockImplementation(() => {
      throw new Error("Disconnect error");
    });

    const { unmount } = renderHook(() => usePreventTabThrottling());

    // Should not throw even if disconnect fails
    expect(() => unmount()).not.toThrow();
  });

  it("should handle errors during gain node disconnect gracefully", () => {
    mocks.useTimerRunning = true;

    mocks.gainNode.disconnect.mockImplementation(() => {
      throw new Error("Gain disconnect error");
    });

    const { unmount } = renderHook(() => usePreventTabThrottling());

    // Should not throw even if gain disconnect fails
    expect(() => unmount()).not.toThrow();
  });

  it("should not call oscillator start before connecting the chain", () => {
    mocks.useTimerRunning = true;

    const callOrder: string[] = [];
    mocks.oscillator.connect.mockImplementation(() => {
      callOrder.push("oscillator.connect");
      return mocks.oscillator;
    });
    mocks.gainNode.connect.mockImplementation(() => {
      callOrder.push("gainNode.connect");
      return mocks.gainNode;
    });
    mocks.oscillator.start.mockImplementation(() => {
      callOrder.push("oscillator.start");
    });

    renderHook(() => usePreventTabThrottling());

    // Verify the connection happens before start
    const connectIndex = callOrder.indexOf("oscillator.connect");
    const gainConnectIndex = callOrder.indexOf("gainNode.connect");
    const startIndex = callOrder.indexOf("oscillator.start");

    expect(connectIndex).toBeLessThan(startIndex);
    expect(gainConnectIndex).toBeLessThan(startIndex);
  });

  it("should set gain value before connecting the chain", () => {
    mocks.useTimerRunning = true;

    const callOrder: string[] = [];
    let storedGainValue = 0;
    const originalGainValueSetter = Object.getOwnPropertyDescriptor(
      mocks.gainNode.gain,
      "value",
    );
    // Track when gain value is set
    Object.defineProperty(mocks.gainNode.gain, "value", {
      set(value) {
        storedGainValue = value;
        callOrder.push("gain.value.set");
      },
      get() {
        return storedGainValue;
      },
      configurable: true,
    });

    mocks.oscillator.connect.mockImplementation(() => {
      callOrder.push("oscillator.connect");
      return mocks.oscillator;
    });

    renderHook(() => usePreventTabThrottling());

    const gainSetValueIndex = callOrder.indexOf("gain.value.set");
    const connectIndex = callOrder.indexOf("oscillator.connect");

    expect(gainSetValueIndex).toBeLessThan(connectIndex);
    expect(mocks.gainNode.gain.value).toBe(0.001);

    // Restore original descriptor
    if (originalGainValueSetter) {
      Object.defineProperty(
        mocks.gainNode.gain,
        "value",
        originalGainValueSetter,
      );
    }
  });
});
