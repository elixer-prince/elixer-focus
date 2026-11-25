import { renderHook } from "@testing-library/react";
import { vi } from "vitest";

let mockDraftSessionCountLimit = "4";

vi.mock("@/features/settings/timer/hooks/useTimerSettingsContext", () => ({
  useTimerSettingsContext: () => ({
    draftFocus: "25",
    draftSessionCountLimit: mockDraftSessionCountLimit,
    draftShortBreak: "5",
    draftLongBreak: "15",
    setDraftFocus: vi.fn(),
    setDraftSessionCountLimit: vi.fn(),
    setDraftShortBreak: vi.fn(),
    setDraftLongBreak: vi.fn(),
  }),
}));

vi.mock("@/features/countdown-timer/stores/session-store", () => ({
  useFocusDuration: () => 25,
  useShortBreakDuration: () => 5,
  useLongBreakDuration: () => 15,
  useSessionCountLimit: () => 4,
}));

import useValidation from "@/features/settings/timer/hooks/useValidation";

describe("useValidation", () => {
  beforeEach(() => {
    mockDraftSessionCountLimit = "4";
  });

  it("should report no unsaved changes when drafts match store values", () => {
    const { result } = renderHook(() => useValidation());

    expect(result.current.hasUnsavedChanges).toBe(false);
  });

  it("should include the session count draft in unsaved changes", () => {
    mockDraftSessionCountLimit = "6";

    const { result } = renderHook(() => useValidation());

    expect(result.current.hasUnsavedChanges).toBe(true);
  });

  it("should accept only whole session counts from 1 through 8", () => {
    const { result } = renderHook(() => useValidation());

    expect(result.current.validateSessionCountLimit("1")).toBe(1);
    expect(result.current.validateSessionCountLimit("8")).toBe(8);
    expect(result.current.validateSessionCountLimit("")).toBeNull();
    expect(result.current.validateSessionCountLimit("0")).toBeNull();
    expect(result.current.validateSessionCountLimit("9")).toBeNull();
    expect(result.current.validateSessionCountLimit("1.5")).toBeNull();
  });

  it("should mark invalid session count drafts", () => {
    mockDraftSessionCountLimit = "1.5";

    const { result } = renderHook(() => useValidation());

    expect(result.current.isSessionCountLimitInvalid).toBe(true);
  });

  it("should validate a valid number and return it", () => {
    const { result } = renderHook(() => useValidation());
    const setDraft = vi.fn();

    const returned = result.current.validateAndSet("30", setDraft, 1);

    expect(returned).toBe(30);
    expect(setDraft).toHaveBeenCalledWith("30");
  });

  it("should handle empty input", () => {
    const { result } = renderHook(() => useValidation());
    const setDraft = vi.fn();

    const returned = result.current.validateAndSet("", setDraft, 1);

    expect(returned).toBeNull();
    expect(setDraft).toHaveBeenCalledWith("");
  });

  it("should revert invalid input to minimum value", () => {
    const { result } = renderHook(() => useValidation());
    const setDraft = vi.fn();

    const returned = result.current.validateAndSet("abc", setDraft, 1);

    expect(returned).toBe(1);
    expect(setDraft).toHaveBeenCalledWith("1");
  });

  it("should allow typing below minimum but not return a valid value", () => {
    const { result } = renderHook(() => useValidation());
    const setDraft = vi.fn();

    const returned = result.current.validateAndSet("0", setDraft, 1);

    expect(returned).toBeNull();
    expect(setDraft).toHaveBeenCalledWith("0");
  });
});
