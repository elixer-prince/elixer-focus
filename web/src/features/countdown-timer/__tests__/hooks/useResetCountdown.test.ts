import { act, renderHook } from "@testing-library/react";

const mocks = vi.hoisted(() => ({
  timerIntervalRef: { current: null as ReturnType<typeof setInterval> | null },
  resetTimerSoundEffectRef: { current: null as HTMLAudioElement | null },
  resetTimerStorage: vi.fn(),
  resetPageTitle: vi.fn(),
  clearIntervalIfItExists: vi.fn(),
  playSound: vi.fn(),
  confirm: vi.fn(),
  convertMinutesToSeconds: vi.fn((minutes: number) => minutes * 60),
  useCurrentSessionType: vi.fn(() => "Focus"),
  useFocusDuration: vi.fn(() => 25),
  useShortBreakDuration: vi.fn(() => 5),
  useLongBreakDuration: vi.fn(() => 15),
  useCustomSessionDuration: vi.fn(() => 30),
  useTimerRunning: vi.fn(() => false),
}));

vi.mock("@/features/countdown-timer/hooks/useCountdownContext", () => ({
  default: () => ({
    timerIntervalRef: mocks.timerIntervalRef,
    resetTimerSoundEffectRef: mocks.resetTimerSoundEffectRef,
  }),
}));

vi.mock("@/hooks/usePageTitle", () => ({
  default: () => ({
    resetPageTitle: mocks.resetPageTitle,
  }),
}));

vi.mock("@/features/countdown-timer/hooks/useCountdownStorage", () => ({
  default: () => ({
    resetTimerStorage: mocks.resetTimerStorage,
  }),
}));

vi.mock("@/features/countdown-timer/stores/countdown-store", () => ({
  useTimerRunning: mocks.useTimerRunning,
}));

vi.mock("@/features/countdown-timer/stores/session-store", () => ({
  useFocusDuration: mocks.useFocusDuration,
  useShortBreakDuration: mocks.useShortBreakDuration,
  useLongBreakDuration: mocks.useLongBreakDuration,
  useCustomSessionDuration: mocks.useCustomSessionDuration,
  useCurrentSessionType: mocks.useCurrentSessionType,
}));

vi.mock("@/utils/interval", () => ({
  clearIntervalIfItExists: mocks.clearIntervalIfItExists,
}));

vi.mock("@/utils/sound", () => ({
  playSound: mocks.playSound,
}));

vi.mock("@/utils/conversion", () => ({
  convertMinutesToSeconds: mocks.convertMinutesToSeconds,
}));

import useResetCountdown from "@/features/countdown-timer/hooks/useResetCountdown";

describe("useResetCountdown", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.timerIntervalRef.current = null;
    globalThis.confirm = mocks.confirm;
    mocks.useCurrentSessionType.mockReturnValue("Focus");
    mocks.useTimerRunning.mockReturnValue(false);
  });

  afterEach(() => {
    delete (globalThis as unknown as { confirm?: typeof globalThis.confirm }).confirm;
  });

  describe("resetCountdown", () => {
    it("should clear the timer interval", () => {
      mocks.timerIntervalRef.current = setInterval(() => {}, 1000);

      const { result } = renderHook(() => useResetCountdown());

      act(() => {
        result.current.resetCountdown();
      });

      expect(mocks.clearIntervalIfItExists).toHaveBeenCalledWith(
        mocks.timerIntervalRef,
      );
    });

    it("should reset timer storage with Focus duration by default", () => {
      const { result } = renderHook(() => useResetCountdown());

      act(() => {
        result.current.resetCountdown();
      });

      expect(mocks.resetTimerStorage).toHaveBeenCalledWith(25);
    });

    it("should reset timer storage with Short Break duration when session type is Short Break", () => {
      mocks.useCurrentSessionType.mockReturnValue("Short Break");

      const { result } = renderHook(() => useResetCountdown());

      act(() => {
        result.current.resetCountdown();
      });

      expect(mocks.resetTimerStorage).toHaveBeenCalledWith(5);
    });

    it("should reset timer storage with Long Break duration when session type is Long Break", () => {
      mocks.useCurrentSessionType.mockReturnValue("Long Break");

      const { result } = renderHook(() => useResetCountdown());

      act(() => {
        result.current.resetCountdown();
      });

      expect(mocks.resetTimerStorage).toHaveBeenCalledWith(15);
    });

    it("should reset timer storage with Custom duration when session type is Custom", () => {
      mocks.useCurrentSessionType.mockReturnValue("Custom");

      const { result } = renderHook(() => useResetCountdown());

      act(() => {
        result.current.resetCountdown();
      });

      expect(mocks.resetTimerStorage).toHaveBeenCalledWith(30);
    });

    it("should reset the page title", () => {
      const { result } = renderHook(() => useResetCountdown());

      act(() => {
        result.current.resetCountdown();
      });

      expect(mocks.resetPageTitle).toHaveBeenCalled();
    });
  });

  describe("resetCountdownWithSound", () => {
    it("should do nothing if timer is not running", () => {
      mocks.useTimerRunning.mockReturnValue(false);

      const { result } = renderHook(() => useResetCountdown());

      act(() => {
        result.current.resetCountdownWithSound();
      });

      expect(mocks.confirm).not.toHaveBeenCalled();
    });

    it("should show confirmation dialog when timer is running", () => {
      mocks.useTimerRunning.mockReturnValue(true);
      mocks.confirm.mockReturnValue(true);

      const { result } = renderHook(() => useResetCountdown());

      act(() => {
        result.current.resetCountdownWithSound();
      });

      expect(mocks.confirm).toHaveBeenCalledWith(
        "Are you sure you want to reset the countdown?",
      );
    });

    it("should reset countdown and play sound when confirmed", () => {
      mocks.useTimerRunning.mockReturnValue(true);
      mocks.confirm.mockReturnValue(true);
      mocks.resetTimerSoundEffectRef.current = {} as HTMLAudioElement;

      const { result } = renderHook(() => useResetCountdown());

      act(() => {
        result.current.resetCountdownWithSound();
      });

      expect(mocks.resetTimerStorage).toHaveBeenCalledWith(25);
      expect(mocks.resetPageTitle).toHaveBeenCalled();
      expect(mocks.playSound).toHaveBeenCalledWith(
        mocks.resetTimerSoundEffectRef.current,
      );
    });

    it("should not reset countdown when confirmation is denied", () => {
      mocks.useTimerRunning.mockReturnValue(true);
      mocks.confirm.mockReturnValue(false);

      const { result } = renderHook(() => useResetCountdown());

      act(() => {
        result.current.resetCountdownWithSound();
      });

      expect(mocks.resetTimerStorage).not.toHaveBeenCalled();
      expect(mocks.playSound).not.toHaveBeenCalled();
    });
  });
});
