import { renderHook, act } from "@testing-library/react";
import { vi } from "vitest";

vi.mock("react-hot-toast", () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const mockSetDraftFocus = vi.fn();
const mockSetDraftSessionCountLimit = vi.fn();
const mockSetDraftShortBreak = vi.fn();
const mockSetDraftLongBreak = vi.fn();

vi.mock("@/features/settings/timer/hooks/useTimerSettingsContext", () => ({
  useTimerSettingsContext: () => ({
    draftFocus: "30",
    draftSessionCountLimit: "6",
    draftShortBreak: "8",
    draftLongBreak: "20",
    setDraftFocus: mockSetDraftFocus,
    setDraftSessionCountLimit: mockSetDraftSessionCountLimit,
    setDraftShortBreak: mockSetDraftShortBreak,
    setDraftLongBreak: mockSetDraftLongBreak,
  }),
}));

vi.mock("@/features/countdown-timer/stores/session-store", () => ({
  useFocusDuration: () => 25,
  useShortBreakDuration: () => 5,
  useLongBreakDuration: () => 15,
  useSessionCountLimit: () => 4,
}));

import toast from "react-hot-toast";
import useHandleReset from "@/features/settings/timer/hooks/useHandleReset";

describe("useHandleReset", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should reset draft values to current store values", () => {
    const { result } = renderHook(() => useHandleReset());

    act(() => {
      result.current.handleReset();
    });

    expect(mockSetDraftFocus).toHaveBeenCalledWith("25");
    expect(mockSetDraftSessionCountLimit).toHaveBeenCalledWith("4");
    expect(mockSetDraftShortBreak).toHaveBeenCalledWith("5");
    expect(mockSetDraftLongBreak).toHaveBeenCalledWith("15");
  });

  it("should show a success toast on reset", () => {
    const { result } = renderHook(() => useHandleReset());

    act(() => {
      result.current.handleReset();
    });

    expect(toast.success).toHaveBeenCalledWith("Changes discarded");
  });
});
