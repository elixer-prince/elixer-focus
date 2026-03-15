import { act, renderHook } from "@testing-library/react";

const mocks = vi.hoisted(() => ({
  playSound: vi.fn(),
  stopSound: vi.fn(),
  timerTickingSoundEffectRef: {
    current: {
      loop: true,
      src: "tick.mp3",
    },
  },
  isEndTickingRef: { current: false },
}));

vi.mock("@/features/countdown-timer/hooks/useCountdownContext", () => ({
  default: () => ({
    timerTickingSoundEffectRef: mocks.timerTickingSoundEffectRef,
    isEndTickingRef: mocks.isEndTickingRef,
  }),
}));

vi.mock("@/utils/sound", () => ({
  playSound: mocks.playSound,
  stopSound: mocks.stopSound,
}));

import useEndTicking from "@/features/countdown-timer/hooks/useEndTicking";

describe("useEndTicking", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.isEndTickingRef.current = false;
    mocks.timerTickingSoundEffectRef.current = {
      loop: true,
      src: "tick.mp3",
    };
  });

  it("should start end ticking and play the sound", () => {
    const { result } = renderHook(() => useEndTicking());

    act(() => {
      result.current.startEndTicking();
    });

    expect(mocks.isEndTickingRef.current).toBe(true);
    expect(mocks.timerTickingSoundEffectRef.current.loop).toBe(false);
    expect(mocks.playSound).toHaveBeenCalledWith(
      mocks.timerTickingSoundEffectRef.current,
    );
  });

  it("should not start end ticking if already ticking", () => {
    mocks.isEndTickingRef.current = true;
    const { result } = renderHook(() => useEndTicking());

    act(() => {
      result.current.startEndTicking();
    });

    expect(mocks.playSound).not.toHaveBeenCalled();
  });

  it("should stop end ticking and stop the sound", () => {
    mocks.isEndTickingRef.current = true;
    const { result } = renderHook(() => useEndTicking());

    act(() => {
      result.current.stopEndTicking();
    });

    expect(mocks.isEndTickingRef.current).toBe(false);
    expect(mocks.stopSound).toHaveBeenCalledWith(
      mocks.timerTickingSoundEffectRef.current,
    );
  });

  it("should not stop end ticking if it is not active", () => {
    const { result } = renderHook(() => useEndTicking());

    act(() => {
      result.current.stopEndTicking();
    });

    expect(mocks.stopSound).not.toHaveBeenCalled();
  });

  it("should log an error if loop cannot be set", () => {
    const error = new Error("Loop blocked");
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    Object.defineProperty(mocks.timerTickingSoundEffectRef.current, "loop", {
      set: () => {
        throw error;
      },
    });

    const { result } = renderHook(() => useEndTicking());

    act(() => {
      result.current.startEndTicking();
    });

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      expect.stringContaining("Error setting loop for sound"),
      error,
    );
    expect(mocks.playSound).toHaveBeenCalled();

    consoleErrorSpy.mockRestore();
  });
});
