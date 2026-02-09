import {
  useSetRemainingTimeInSeconds,
  useSetStartTimeInMinutes,
  useStartTimeInMinutes,
  useTimerPaused,
  useTimerRunning,
} from "@/stores/CountdownTimerStore";
import {
  useCurrentSessionType,
  useFocusDuration,
  useLongBreakDuration,
  useShortBreakDuration,
} from "@/features/countdown-timer/stores/SessionStore";
import { convertMinutesToSeconds } from "@/utils/conversion";
import { saveToLocalStorage } from "@/utils/storage";
import { useEffect } from "react";

const useAutoSyncTimer = () => {
  const focusDuration = useFocusDuration();
  const shortBreakDuration = useShortBreakDuration();
  const longBreakDuration = useLongBreakDuration();
  const currentSessionType = useCurrentSessionType();

  const timerRunning = useTimerRunning();
  const timerPaused = useTimerPaused();
  const startTimeInMinutes = useStartTimeInMinutes();
  const setStartTimeInMinutes = useSetStartTimeInMinutes();
  const setRemainingTimeInSeconds = useSetRemainingTimeInSeconds();

  useEffect(() => {
    // Only sync if timer is NOT actively running
    // timerPaused = true means timer is stopped
    // timerRunning = false means timer isn't counting down
    const isTimerIdle = !timerRunning || timerPaused;

    if (!isTimerIdle) {
      // Timer is running - don't change it!
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
    if (correctDuration !== startTimeInMinutes) {
      // Update timer state
      setStartTimeInMinutes(correctDuration);
      setRemainingTimeInSeconds(convertMinutesToSeconds(correctDuration));

      // Persist to localStorage
      saveToLocalStorage("startTimeInMinutes", correctDuration);
      saveToLocalStorage(
        "remainingTimeInSeconds",
        convertMinutesToSeconds(correctDuration),
      );

      console.log(
        `Auto-synced timer: ${currentSessionType} = ${correctDuration}min`,
      );
    }
  }, [
    focusDuration,
    shortBreakDuration,
    longBreakDuration,
    currentSessionType,
    timerRunning,
    timerPaused,
    startTimeInMinutes,
    setStartTimeInMinutes,
    setRemainingTimeInSeconds,
  ]);
};

export default useAutoSyncTimer;
