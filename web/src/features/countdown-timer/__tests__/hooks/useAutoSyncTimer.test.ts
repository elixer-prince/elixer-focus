import { renderHook } from "@testing-library/react";

const mocks = vi.hoisted(() => ({
  useFocusDuration: vi.fn(() => 25),
  useShortBreakDuration: vi.fn(() => 5),
  useLongBreakDuration: vi.fn(() => 15),
  useCurrentSessionType: vi.fn(() => "Focus"),
  useTimerRunning: vi.fn(() => false),
  useTimerPaused: vi.fn(() => true),
  useStartTimeInMinutes: vi.fn(() => 25),
  useRemainingTimeInSeconds: vi.fn(() => 1500),
  useSetStartTimeInMinutes: vi.fn(() => vi.fn()),
  useSetRemainingTimeInSeconds: vi.fn(() => vi.fn()),
  setStartTimeInMinutesMock: vi.fn(),
  setRemainingTimeInSecondsMock: vi.fn(),
}));

vi.mock("@/features/countdown-timer/stores/session-store", () => ({
  useFocusDuration: mocks.useFocusDuration,
  useShortBreakDuration: mocks.useShortBreakDuration,
  useLongBreakDuration: mocks.useLongBreakDuration,
  useCurrentSessionType: mocks.useCurrentSessionType,
}));

vi.mock("@/features/countdown-timer/stores/countdown-store", () => ({
  useTimerRunning: mocks.useTimerRunning,
  useTimerPaused: mocks.useTimerPaused,
  useStartTimeInMinutes: mocks.useStartTimeInMinutes,
  useRemainingTimeInSeconds: mocks.useRemainingTimeInSeconds,
  useSetStartTimeInMinutes: () => mocks.setStartTimeInMinutesMock,
  useSetRemainingTimeInSeconds: () => mocks.setRemainingTimeInSecondsMock,
}));

import useAutoSyncTimer from "@/features/countdown-timer/hooks/useAutoSyncTimer";

describe("useAutoSyncTimer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.useTimerRunning.mockReturnValue(false);
    mocks.useTimerPaused.mockReturnValue(true);
    mocks.useCurrentSessionType.mockReturnValue("Focus");
    mocks.useFocusDuration.mockReturnValue(25);
    mocks.useShortBreakDuration.mockReturnValue(5);
    mocks.useLongBreakDuration.mockReturnValue(15);
    mocks.useStartTimeInMinutes.mockReturnValue(25);
    mocks.useRemainingTimeInSeconds.mockReturnValue(1500);
  });

  it("should sync timer when remainingTimeInSeconds is stale on page refresh", () => {
    // Simulate page refresh: startTimeInMinutes restored from localStorage (correct),
    // but remainingTimeInSeconds defaults to 25 minutes (1500s) instead of the
    // configured long break duration (5 minutes = 300s)
    mocks.useCurrentSessionType.mockReturnValue("Long Break");
    mocks.useLongBreakDuration.mockReturnValue(5);
    mocks.useStartTimeInMinutes.mockReturnValue(5);
    mocks.useRemainingTimeInSeconds.mockReturnValue(1500);

    renderHook(() => useAutoSyncTimer());

    expect(mocks.setStartTimeInMinutesMock).toHaveBeenCalledWith(5);
    expect(mocks.setRemainingTimeInSecondsMock).toHaveBeenCalledWith(300);
  });

  it("should sync timer when startTimeInMinutes is stale", () => {
    mocks.useCurrentSessionType.mockReturnValue("Short Break");
    mocks.useShortBreakDuration.mockReturnValue(5);
    mocks.useStartTimeInMinutes.mockReturnValue(25);
    mocks.useRemainingTimeInSeconds.mockReturnValue(1500);

    renderHook(() => useAutoSyncTimer());

    expect(mocks.setStartTimeInMinutesMock).toHaveBeenCalledWith(5);
    expect(mocks.setRemainingTimeInSecondsMock).toHaveBeenCalledWith(300);
  });

  it("should not sync when both values already match the correct duration", () => {
    mocks.useCurrentSessionType.mockReturnValue("Focus");
    mocks.useFocusDuration.mockReturnValue(25);
    mocks.useStartTimeInMinutes.mockReturnValue(25);
    mocks.useRemainingTimeInSeconds.mockReturnValue(1500);

    renderHook(() => useAutoSyncTimer());

    expect(mocks.setStartTimeInMinutesMock).not.toHaveBeenCalled();
    expect(mocks.setRemainingTimeInSecondsMock).not.toHaveBeenCalled();
  });

  it("should not sync when timer is actively running and not paused", () => {
    mocks.useTimerRunning.mockReturnValue(true);
    mocks.useTimerPaused.mockReturnValue(false);
    mocks.useCurrentSessionType.mockReturnValue("Short Break");
    mocks.useShortBreakDuration.mockReturnValue(5);
    mocks.useStartTimeInMinutes.mockReturnValue(25);
    mocks.useRemainingTimeInSeconds.mockReturnValue(1500);

    renderHook(() => useAutoSyncTimer());

    expect(mocks.setStartTimeInMinutesMock).not.toHaveBeenCalled();
    expect(mocks.setRemainingTimeInSecondsMock).not.toHaveBeenCalled();
  });

  it("should preserve the remaining time when a running timer is paused", () => {
    mocks.useTimerRunning.mockReturnValue(true);
    mocks.useTimerPaused.mockReturnValue(true);
    mocks.useCurrentSessionType.mockReturnValue("Short Break");
    mocks.useShortBreakDuration.mockReturnValue(5);
    mocks.useStartTimeInMinutes.mockReturnValue(5);
    mocks.useRemainingTimeInSeconds.mockReturnValue(210);

    renderHook(() => useAutoSyncTimer());

    expect(mocks.setStartTimeInMinutesMock).not.toHaveBeenCalled();
    expect(mocks.setRemainingTimeInSecondsMock).not.toHaveBeenCalled();
  });

  it("should sync Focus session duration correctly", () => {
    mocks.useCurrentSessionType.mockReturnValue("Focus");
    mocks.useFocusDuration.mockReturnValue(20);
    mocks.useStartTimeInMinutes.mockReturnValue(25);
    mocks.useRemainingTimeInSeconds.mockReturnValue(1500);

    renderHook(() => useAutoSyncTimer());

    expect(mocks.setStartTimeInMinutesMock).toHaveBeenCalledWith(20);
    expect(mocks.setRemainingTimeInSecondsMock).toHaveBeenCalledWith(1200);
  });

  it("should sync Short Break duration correctly", () => {
    mocks.useCurrentSessionType.mockReturnValue("Short Break");
    mocks.useShortBreakDuration.mockReturnValue(10);
    mocks.useStartTimeInMinutes.mockReturnValue(25);
    mocks.useRemainingTimeInSeconds.mockReturnValue(1500);

    renderHook(() => useAutoSyncTimer());

    expect(mocks.setStartTimeInMinutesMock).toHaveBeenCalledWith(10);
    expect(mocks.setRemainingTimeInSecondsMock).toHaveBeenCalledWith(600);
  });

  it("should sync Long Break duration correctly", () => {
    mocks.useCurrentSessionType.mockReturnValue("Long Break");
    mocks.useLongBreakDuration.mockReturnValue(15);
    mocks.useStartTimeInMinutes.mockReturnValue(25);
    mocks.useRemainingTimeInSeconds.mockReturnValue(1500);

    renderHook(() => useAutoSyncTimer());

    expect(mocks.setStartTimeInMinutesMock).toHaveBeenCalledWith(15);
    expect(mocks.setRemainingTimeInSecondsMock).toHaveBeenCalledWith(900);
  });

  it("should default to Focus duration for unknown session types", () => {
    mocks.useCurrentSessionType.mockReturnValue("Custom Focus");
    mocks.useFocusDuration.mockReturnValue(25);
    mocks.useStartTimeInMinutes.mockReturnValue(10);
    mocks.useRemainingTimeInSeconds.mockReturnValue(600);

    renderHook(() => useAutoSyncTimer());

    expect(mocks.setStartTimeInMinutesMock).toHaveBeenCalledWith(25);
    expect(mocks.setRemainingTimeInSecondsMock).toHaveBeenCalledWith(1500);
  });

  it("should sync when only remainingTimeInSeconds is stale but startTimeInMinutes is correct", () => {
    // This is the key regression test for the bug fix:
    // startTimeInMinutes matches the duration, but remainingTimeInSeconds does not
    mocks.useCurrentSessionType.mockReturnValue("Long Break");
    mocks.useLongBreakDuration.mockReturnValue(5);
    mocks.useStartTimeInMinutes.mockReturnValue(5);
    mocks.useRemainingTimeInSeconds.mockReturnValue(1500);

    renderHook(() => useAutoSyncTimer());

    expect(mocks.setStartTimeInMinutesMock).toHaveBeenCalledWith(5);
    expect(mocks.setRemainingTimeInSecondsMock).toHaveBeenCalledWith(300);
  });

  it("should not sync when timer is stopped (timerRunning false) but values match", () => {
    mocks.useTimerRunning.mockReturnValue(false);
    mocks.useTimerPaused.mockReturnValue(true);
    mocks.useCurrentSessionType.mockReturnValue("Focus");
    mocks.useFocusDuration.mockReturnValue(25);
    mocks.useStartTimeInMinutes.mockReturnValue(25);
    mocks.useRemainingTimeInSeconds.mockReturnValue(1500);

    renderHook(() => useAutoSyncTimer());

    expect(mocks.setStartTimeInMinutesMock).not.toHaveBeenCalled();
    expect(mocks.setRemainingTimeInSecondsMock).not.toHaveBeenCalled();
  });
});
