import {
  useRemainingTimeInSeconds,
  useSetRemainingTimeInSeconds,
  useSetStartTimeInMinutes,
  useStartTimeInMinutes,
  useTimerRunning,
} from "@/features/countdown-timer/stores/countdown-store";
import {
  useCurrentSessionType,
  useFocusDuration,
  useLongBreakDuration,
  useShortBreakDuration,
} from "@/features/countdown-timer/stores/session-store";
import { convertMinutesToSeconds } from "@/utils/conversion";
import { getFromLocalStorage } from "@/utils/storage";
import { useEffect } from "react";

const useAutoSyncTimer = () => {
  const focusDuration = useFocusDuration();
  const shortBreakDuration = useShortBreakDuration();
  const longBreakDuration = useLongBreakDuration();
  const currentSessionType = useCurrentSessionType();

  const timerRunning = useTimerRunning();
  const startTimeInMinutes = useStartTimeInMinutes();
  const remainingTimeInSeconds = useRemainingTimeInSeconds();
  const setStartTimeInMinutes = useSetStartTimeInMinutes();
  const setRemainingTimeInSeconds = useSetRemainingTimeInSeconds();

  useEffect(() => {
    // Only sync if the timer has not been started
    const isTimerIdle = !timerRunning;

    if (!isTimerIdle) {
      // Timer is running - don't change it!
      return;
    }

    const hasSavedEndTime =
      getFromLocalStorage<number>("timerEndTime") !== null;
    const hasSavedPausedTime =
      getFromLocalStorage<number>("timerPausedRemainingTime") !== null;
    if (hasSavedEndTime || hasSavedPausedTime) {
      return;
    }

    // Get the correct duration for the current session type
    let correctDuration;

    switch (currentSessionType) {
      case "Focus":
        correctDuration = focusDuration;
        break;
      case "Short Break":
        correctDuration = shortBreakDuration;
        break;
      case "Long Break":
        correctDuration = longBreakDuration;
        break;
      default:
        correctDuration = focusDuration;
    }

    // Only update if the duration has actually changed
    // Check both startTimeInMinutes and remainingTimeInSeconds since
    // remainingTimeInSeconds is not persisted and may be stale on page refresh
    const correctRemainingSeconds = convertMinutesToSeconds(correctDuration);
    if (
      correctDuration !== startTimeInMinutes ||
      correctRemainingSeconds !== remainingTimeInSeconds
    ) {
      // Update timer state
      setStartTimeInMinutes(correctDuration);
      setRemainingTimeInSeconds(correctRemainingSeconds);
    }
  }, [
    focusDuration,
    shortBreakDuration,
    longBreakDuration,
    currentSessionType,
    timerRunning,
    startTimeInMinutes,
    remainingTimeInSeconds,
    setStartTimeInMinutes,
    setRemainingTimeInSeconds,
  ]);
};

export default useAutoSyncTimer;
