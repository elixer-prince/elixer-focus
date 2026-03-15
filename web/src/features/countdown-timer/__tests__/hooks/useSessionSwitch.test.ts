import { act, renderHook } from "@testing-library/react";

const mocks = vi.hoisted(() => ({
  timerIntervalRef: { current: null as ReturnType<typeof setInterval> | null },
  timerEndTimeRef: { current: null as number | null },
  resetTimerStorage: vi.fn(),
  resetPageTitle: vi.fn(),
  confirm: vi.fn(),
  useTimerRunning: vi.fn(() => false),
  useFocusDuration: vi.fn(() => 25),
  useShortBreakDuration: vi.fn(() => 5),
  useLongBreakDuration: vi.fn(() => 15),
  useCustomSessionDuration: vi.fn(() => 30),
  useCurrentSessionType: vi.fn(() => "Focus"),
  useCurrentSessionCount: vi.fn(() => 0),
  useSessionCountLimit: vi.fn(() => 4),
  setCurrentSessionTypeMock: vi.fn(),
  incrementCurrentSessionCountMock: vi.fn(),
  resetCurrentSessionCountMock: vi.fn(),
}));

vi.mock("@/features/countdown-timer/hooks/useCountdownContext", () => ({
  default: () => ({
    timerIntervalRef: mocks.timerIntervalRef,
    timerEndTimeRef: mocks.timerEndTimeRef,
  }),
}));

vi.mock("@/features/countdown-timer/hooks/useCountdownStorage", () => ({
  default: () => ({
    resetTimerStorage: mocks.resetTimerStorage,
  }),
}));

vi.mock("@/hooks/usePageTitle", () => ({
  default: () => ({
    resetPageTitle: mocks.resetPageTitle,
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
  useCurrentSessionCount: mocks.useCurrentSessionCount,
  useSessionCountLimit: mocks.useSessionCountLimit,
  useSetCurrentSessionType: () => mocks.setCurrentSessionTypeMock,
  useIncrementCurrentSessionCount: () => mocks.incrementCurrentSessionCountMock,
  useResetCurrentSessionCount: () => mocks.resetCurrentSessionCountMock,
}));

import useSessionSwitch from "@/features/countdown-timer/hooks/useSessionSwitch";

describe("useSessionSwitch", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.useTimerRunning.mockReturnValue(false);
    mocks.useCurrentSessionType.mockReturnValue("Focus");
    mocks.useCurrentSessionCount.mockReturnValue(0);
    mocks.useSessionCountLimit.mockReturnValue(4);
    globalThis.confirm = mocks.confirm;
  });

  afterEach(() => {
    delete (globalThis as unknown as { confirm?: typeof globalThis.confirm })
      .confirm;
  });

  describe("autoSwitchSessionType", () => {
    it("should switch from Short Break to Focus", () => {
      mocks.useCurrentSessionType.mockReturnValue("Short Break");

      const { result } = renderHook(() => useSessionSwitch());

      act(() => {
        result.current.autoSwitchSessionType();
      });

      expect(mocks.setCurrentSessionTypeMock).toHaveBeenCalledWith("Focus");
      expect(mocks.resetTimerStorage).toHaveBeenCalledWith(25);
      expect(mocks.resetPageTitle).toHaveBeenCalled();
    });

    it("should switch from Long Break to Focus and reset session count", () => {
      mocks.useCurrentSessionType.mockReturnValue("Long Break");

      const { result } = renderHook(() => useSessionSwitch());

      act(() => {
        result.current.autoSwitchSessionType();
      });

      expect(mocks.setCurrentSessionTypeMock).toHaveBeenCalledWith("Focus");
      expect(mocks.resetTimerStorage).toHaveBeenCalledWith(25);
      expect(mocks.resetCurrentSessionCountMock).toHaveBeenCalled();
    });

    it("should switch from Custom to Focus", () => {
      mocks.useCurrentSessionType.mockReturnValue("Custom");

      const { result } = renderHook(() => useSessionSwitch());

      act(() => {
        result.current.autoSwitchSessionType();
      });

      expect(mocks.setCurrentSessionTypeMock).toHaveBeenCalledWith("Focus");
      expect(mocks.resetTimerStorage).toHaveBeenCalledWith(25);
    });

    it("should switch to Long Break when session count reaches limit", () => {
      mocks.useCurrentSessionType.mockReturnValue("Focus");
      mocks.useCurrentSessionCount.mockReturnValue(3);

      const { result } = renderHook(() => useSessionSwitch());

      act(() => {
        result.current.autoSwitchSessionType();
      });

      expect(mocks.setCurrentSessionTypeMock).toHaveBeenCalledWith(
        "Long Break",
      );
      expect(mocks.resetTimerStorage).toHaveBeenCalledWith(15);
      expect(mocks.resetCurrentSessionCountMock).toHaveBeenCalled();
    });

    it("should switch to Short Break when session count is below limit", () => {
      mocks.useCurrentSessionType.mockReturnValue("Focus");
      mocks.useCurrentSessionCount.mockReturnValue(1);

      const { result } = renderHook(() => useSessionSwitch());

      act(() => {
        result.current.autoSwitchSessionType();
      });

      expect(mocks.setCurrentSessionTypeMock).toHaveBeenCalledWith(
        "Short Break",
      );
      expect(mocks.resetTimerStorage).toHaveBeenCalledWith(5);
      expect(mocks.incrementCurrentSessionCountMock).toHaveBeenCalled();
    });
  });

  describe("switchToFocus", () => {
    it("should do nothing if already on Focus session", () => {
      mocks.useCurrentSessionType.mockReturnValue("Focus");

      const { result } = renderHook(() => useSessionSwitch());

      act(() => {
        result.current.switchToFocus();
      });

      expect(mocks.resetTimerStorage).not.toHaveBeenCalled();
      expect(mocks.confirm).not.toHaveBeenCalled();
    });

    it("should switch immediately when timer is not running", () => {
      mocks.useTimerRunning.mockReturnValue(false);
      mocks.useCurrentSessionType.mockReturnValue("Short Break");

      const { result } = renderHook(() => useSessionSwitch());

      act(() => {
        result.current.switchToFocus();
      });

      expect(mocks.setCurrentSessionTypeMock).toHaveBeenCalledWith("Focus");
      expect(mocks.resetTimerStorage).toHaveBeenCalledWith(25);
      expect(mocks.confirm).not.toHaveBeenCalled();
    });

    it("should show confirmation dialog when timer is running", () => {
      mocks.useTimerRunning.mockReturnValue(true);
      mocks.useCurrentSessionType.mockReturnValue("Short Break");
      mocks.confirm.mockReturnValue(true);

      const { result } = renderHook(() => useSessionSwitch());

      act(() => {
        result.current.switchToFocus();
      });

      expect(mocks.confirm).toHaveBeenCalledWith(
        "Switching sessions will reset the current timer. Do you want to proceed?",
      );
    });

    it("should switch when confirmed while timer is running", () => {
      mocks.useTimerRunning.mockReturnValue(true);
      mocks.useCurrentSessionType.mockReturnValue("Short Break");
      mocks.confirm.mockReturnValue(true);

      const { result } = renderHook(() => useSessionSwitch());

      act(() => {
        result.current.switchToFocus();
      });

      expect(mocks.setCurrentSessionTypeMock).toHaveBeenCalledWith("Focus");
      expect(mocks.resetTimerStorage).toHaveBeenCalledWith(25);
      expect(mocks.resetPageTitle).toHaveBeenCalled();
    });

    it("should not switch when confirmation is denied", () => {
      mocks.useTimerRunning.mockReturnValue(true);
      mocks.useCurrentSessionType.mockReturnValue("Short Break");
      mocks.confirm.mockReturnValue(false);

      const { result } = renderHook(() => useSessionSwitch());

      act(() => {
        result.current.switchToFocus();
      });

      expect(mocks.resetTimerStorage).not.toHaveBeenCalled();
    });
  });

  describe("switchToShortBreak", () => {
    it("should do nothing if already on Short Break session", () => {
      mocks.useCurrentSessionType.mockReturnValue("Short Break");

      const { result } = renderHook(() => useSessionSwitch());

      act(() => {
        result.current.switchToShortBreak();
      });

      expect(mocks.resetTimerStorage).not.toHaveBeenCalled();
    });

    it("should switch immediately when timer is not running", () => {
      mocks.useTimerRunning.mockReturnValue(false);
      mocks.useCurrentSessionType.mockReturnValue("Focus");

      const { result } = renderHook(() => useSessionSwitch());

      act(() => {
        result.current.switchToShortBreak();
      });

      expect(mocks.setCurrentSessionTypeMock).toHaveBeenCalledWith(
        "Short Break",
      );
      expect(mocks.resetTimerStorage).toHaveBeenCalledWith(5);
    });
  });

  describe("switchToLongBreak", () => {
    it("should do nothing if already on Long Break session", () => {
      mocks.useCurrentSessionType.mockReturnValue("Long Break");

      const { result } = renderHook(() => useSessionSwitch());

      act(() => {
        result.current.switchToLongBreak();
      });

      expect(mocks.resetTimerStorage).not.toHaveBeenCalled();
    });

    it("should switch immediately when timer is not running", () => {
      mocks.useTimerRunning.mockReturnValue(false);
      mocks.useCurrentSessionType.mockReturnValue("Focus");

      const { result } = renderHook(() => useSessionSwitch());

      act(() => {
        result.current.switchToLongBreak();
      });

      expect(mocks.setCurrentSessionTypeMock).toHaveBeenCalledWith(
        "Long Break",
      );
      expect(mocks.resetTimerStorage).toHaveBeenCalledWith(15);
    });
  });

  describe("switchToCustom", () => {
    it("should do nothing if already on Custom session", () => {
      mocks.useCurrentSessionType.mockReturnValue("Custom");

      const { result } = renderHook(() => useSessionSwitch());

      act(() => {
        result.current.switchToCustom();
      });

      expect(mocks.resetTimerStorage).not.toHaveBeenCalled();
    });

    it("should switch immediately when timer is not running", () => {
      mocks.useTimerRunning.mockReturnValue(false);
      mocks.useCurrentSessionType.mockReturnValue("Focus");

      const { result } = renderHook(() => useSessionSwitch());

      act(() => {
        result.current.switchToCustom();
      });

      expect(mocks.setCurrentSessionTypeMock).toHaveBeenCalledWith("Custom");
      expect(mocks.resetTimerStorage).toHaveBeenCalledWith(30);
    });
  });

  describe("updateCustomDurationAndReset", () => {
    it("should update duration and reset when current session is Custom", () => {
      mocks.useCurrentSessionType.mockReturnValue("Custom");

      const { result } = renderHook(() => useSessionSwitch());

      act(() => {
        result.current.updateCustomDurationAndReset(45);
      });

      expect(mocks.setCurrentSessionTypeMock).toHaveBeenCalledWith("Custom");
      expect(mocks.resetTimerStorage).toHaveBeenCalledWith(45);
    });

    it("should do nothing when current session is not Custom", () => {
      mocks.useCurrentSessionType.mockReturnValue("Focus");

      const { result } = renderHook(() => useSessionSwitch());

      act(() => {
        result.current.updateCustomDurationAndReset(45);
      });

      expect(mocks.resetTimerStorage).not.toHaveBeenCalled();
    });
  });
});
