import { renderHook, act } from "@testing-library/react";
import { vi } from "vitest";

// Factory-based mocks so each test can set different values
const mockSetDraftFocus = vi.fn();
const mockSetDraftShortBreak = vi.fn();
const mockSetDraftLongBreak = vi.fn();

const mockContext = {
  draftFocus: "30",
  draftSessionCountLimit: "4",
  draftShortBreak: "8",
  draftLongBreak: "20",
  setDraftFocus: mockSetDraftFocus,
  setDraftSessionCountLimit: vi.fn(),
  setDraftShortBreak: mockSetDraftShortBreak,
  setDraftLongBreak: mockSetDraftLongBreak,
};

const { mockDispatchTimerCommand } = vi.hoisted(() => ({
  mockDispatchTimerCommand: vi.fn(),
}));

vi.mock("@/features/countdown-timer/services/timer-coordinator", () => ({
  dispatchTimerCommand: mockDispatchTimerCommand,
}));

vi.mock("react-hot-toast", () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock("@/features/settings/timer/hooks/useTimerSettingsContext", () => ({
  useTimerSettingsContext: () => mockContext,
}));

const mockSetFocusDuration = vi.fn();
const mockSetShortBreakDuration = vi.fn();
const mockSetLongBreakDuration = vi.fn();
const mockSetStartTimeInMinutes = vi.fn();
const mockSetRemainingTimeInSeconds = vi.fn();

let mockTimerRunning = false;
let mockTimerPaused = false;
let mockCurrentSessionType = "Focus";

vi.mock("@/features/countdown-timer/stores/session-store", () => ({
  useCurrentSessionType: () => mockCurrentSessionType,
  useSetFocusDuration: () => mockSetFocusDuration,
  useSetShortBreakDuration: () => mockSetShortBreakDuration,
  useSetLongBreakDuration: () => mockSetLongBreakDuration,
}));

vi.mock("@/features/countdown-timer/stores/countdown-store", () => ({
  useTimerRunning: () => mockTimerRunning,
  useTimerPaused: () => mockTimerPaused,
  useSetStartTimeInMinutes: () => mockSetStartTimeInMinutes,
  useSetRemainingTimeInSeconds: () => mockSetRemainingTimeInSeconds,
}));

vi.mock("@/features/settings/timer/hooks/useValidation", () => ({
  default: () => ({
    hasUnsavedChanges: true,
    validateSessionCountLimit: (value: string) => {
      const num = Number(value);
      return value !== "" && Number.isInteger(num) && num >= 1 && num <= 8
        ? num
        : null;
    },
    validateAndSet: (
      value: string,
      setDraft: (v: string) => void,
      min: number,
    ) => {
      const num = Number(value);
      if (value === "") return null;
      if (isNaN(num) || !isFinite(num)) {
        setDraft(min.toString());
        return min;
      }
      if (num < min) {
        setDraft(value);
        return null;
      }
      setDraft(value);
      return num;
    },
  }),
}));

import toast from "react-hot-toast";
import useHandleSave from "@/features/settings/timer/hooks/useHandleSave";

describe("useHandleSave", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockTimerRunning = false;
    mockTimerPaused = false;
    mockCurrentSessionType = "Focus";
    mockContext.draftFocus = "30";
    mockContext.draftSessionCountLimit = "4";
    mockContext.draftShortBreak = "8";
    mockContext.draftLongBreak = "20";
  });

  it("should save valid durations to session stores", () => {
    const { result } = renderHook(() => useHandleSave());

    act(() => {
      result.current.handleSave();
    });

    expect(mockSetFocusDuration).toHaveBeenCalledWith(30);
    expect(mockSetShortBreakDuration).toHaveBeenCalledWith(8);
    expect(mockSetLongBreakDuration).toHaveBeenCalledWith(20);
  });

  it("should save the session count through the timer coordinator", () => {
    const { result } = renderHook(() => useHandleSave());

    act(() => {
      result.current.handleSave();
    });

    expect(mockDispatchTimerCommand).toHaveBeenCalledWith({
      type: "set-session-count-limit",
      limit: 4,
    });
  });

  it("should block all settings from saving when the session count is invalid", () => {
    mockContext.draftSessionCountLimit = "1.5";

    const { result } = renderHook(() => useHandleSave());

    act(() => {
      result.current.handleSave();
    });

    expect(mockSetFocusDuration).not.toHaveBeenCalled();
    expect(mockSetShortBreakDuration).not.toHaveBeenCalled();
    expect(mockSetLongBreakDuration).not.toHaveBeenCalled();
    expect(mockDispatchTimerCommand).not.toHaveBeenCalled();
  });

  it("should show a success toast on valid save", () => {
    const { result } = renderHook(() => useHandleSave());

    act(() => {
      result.current.handleSave();
    });

    expect(toast.success).toHaveBeenCalledWith(
      "Timer settings saved successfully!",
    );
  });

  it("should auto-update the timer when timer is idle", () => {
    const { result } = renderHook(() => useHandleSave());

    act(() => {
      result.current.handleSave();
    });

    expect(mockSetStartTimeInMinutes).toHaveBeenCalledWith(30);
    expect(mockSetRemainingTimeInSeconds).toHaveBeenCalledWith(30 * 60);
  });

  it("should not auto-update the timer when timer is running", () => {
    mockTimerRunning = true;

    const { result } = renderHook(() => useHandleSave());

    act(() => {
      result.current.handleSave();
    });

    expect(mockSetStartTimeInMinutes).not.toHaveBeenCalled();
    expect(mockSetRemainingTimeInSeconds).not.toHaveBeenCalled();
  });

  it("should not auto-update the timer when timer is paused", () => {
    mockTimerPaused = true;

    const { result } = renderHook(() => useHandleSave());

    act(() => {
      result.current.handleSave();
    });

    // Paused timer is considered idle, so it SHOULD update
    expect(mockSetStartTimeInMinutes).toHaveBeenCalledWith(30);
    expect(mockSetRemainingTimeInSeconds).toHaveBeenCalledWith(30 * 60);
  });

  it("should show error toast for invalid focus duration", () => {
    mockContext.draftFocus = "0";

    const { result } = renderHook(() => useHandleSave());

    act(() => {
      result.current.handleSave();
    });

    expect(toast.error).toHaveBeenCalledWith(
      "Focus duration must be at least 1 minute",
    );
  });

  it("should show error toast for invalid short break duration", () => {
    mockContext.draftShortBreak = "0";

    const { result } = renderHook(() => useHandleSave());

    act(() => {
      result.current.handleSave();
    });

    expect(toast.error).toHaveBeenCalledWith(
      "Short break must be at least 1 minute",
    );
  });

  it("should show error toast for invalid long break duration", () => {
    mockContext.draftLongBreak = "3";

    const { result } = renderHook(() => useHandleSave());

    act(() => {
      result.current.handleSave();
    });

    expect(toast.error).toHaveBeenCalledWith(
      "Long break must be at least 5 minutes",
    );
  });

  it("should not update stores when validation fails", () => {
    mockContext.draftFocus = "0";

    const { result } = renderHook(() => useHandleSave());

    act(() => {
      result.current.handleSave();
    });

    expect(mockSetFocusDuration).not.toHaveBeenCalled();
    expect(mockSetShortBreakDuration).not.toHaveBeenCalled();
    expect(mockSetLongBreakDuration).not.toHaveBeenCalled();
  });

  it("should update timer with correct duration for short break session", () => {
    mockCurrentSessionType = "Short Break";

    const { result } = renderHook(() => useHandleSave());

    act(() => {
      result.current.handleSave();
    });

    expect(mockSetStartTimeInMinutes).toHaveBeenCalledWith(8);
    expect(mockSetRemainingTimeInSeconds).toHaveBeenCalledWith(8 * 60);
  });

  it("should update timer with correct duration for long break session", () => {
    mockCurrentSessionType = "Long Break";

    const { result } = renderHook(() => useHandleSave());

    act(() => {
      result.current.handleSave();
    });

    expect(mockSetStartTimeInMinutes).toHaveBeenCalledWith(20);
    expect(mockSetRemainingTimeInSeconds).toHaveBeenCalledWith(20 * 60);
  });

  it("should reset draft focus to default on validation error", () => {
    mockContext.draftFocus = "0";

    const { result } = renderHook(() => useHandleSave());

    act(() => {
      result.current.handleSave();
    });

    expect(mockSetDraftFocus).toHaveBeenCalledWith("25");
  });

  it("should reset draft long break to default on validation error", () => {
    mockContext.draftLongBreak = "3";

    const { result } = renderHook(() => useHandleSave());

    act(() => {
      result.current.handleSave();
    });

    expect(mockSetDraftLongBreak).toHaveBeenCalledWith("15");
  });
});
