import { useCountdownTimerContext } from "@/features/CountdownTimer/stores/CountdownTimerContext";
import {
  useSetRemainingTimeInSeconds,
  useSetStartTimeInMinutes,
  useSetTimerPaused,
  useSetTimerRunning,
  useTimerRunning,
} from "@/features/CountdownTimer/stores/CountdownTimerStore";
import {
  useCurrentSessionCount,
  useCurrentSessionType,
  useFocusDuration,
  useLongBreakDuration,
  useSessionCountLimit,
  useSetCurrentSessionCount,
  useSetCurrentSessionType,
  useShortBreakDuration,
} from "@/features/CountdownTimer/stores/SessionStore";
import { convertMinutesToSeconds } from "@/utils/conversion";
import { saveToLocalStorage } from "@/utils/storage";

const useSessionSwitch = () => {
  const { timerIntervalRef, timerEndTimeRef } = useCountdownTimerContext();

  const focusDuration = useFocusDuration();
  const shortBreakDuration = useShortBreakDuration();
  const longBreakDuration = useLongBreakDuration();
  const currentSessionType = useCurrentSessionType();
  const currentSessionCount = useCurrentSessionCount();
  const sessionCountLimit = useSessionCountLimit();
  const setCurrentSessionType = useSetCurrentSessionType();
  const setCurrentSessionCount = useSetCurrentSessionCount();

  const timerRunning = useTimerRunning();
  const setTimerRunning = useSetTimerRunning();
  const setTimerPaused = useSetTimerPaused();
  const setStartTimeInMinutes = useSetStartTimeInMinutes();
  const setRemainingTimeInSeconds = useSetRemainingTimeInSeconds();

  const confirmationMessage =
    "Switching sessions will reset the current timer. Do you want to proceed?";

  const switchSessionType = () => {
    switch (currentSessionType) {
      case "Short Break":
        updateFocusDurationAndReset();
        break;
      case "Long Break":
        updateFocusDurationAndReset();
        break;
      default:
        handleBreakSwitching();
    }
  };

  const updateFocusDurationAndReset = () => {
    setCurrentSessionType("Focus");
    resetTimer(focusDuration);
  };

  const updateShortBreakDurationAndReset = () => {
    setCurrentSessionType("Short Break");
    resetTimer(shortBreakDuration);
  };

  const updateLongBreakDurationAndReset = () => {
    setCurrentSessionType("Long Break");
    resetTimer(longBreakDuration);
  };

  const updateSessionCount = (newSessionCount: number) => {
    setCurrentSessionCount(newSessionCount);
  };

  const handleBreakSwitching = () => {
    if (currentSessionCount + 1 >= sessionCountLimit) {
      updateLongBreakDurationAndReset();
      return updateSessionCount(0);
    }

    updateShortBreakDurationAndReset();
    setCurrentSessionCount(currentSessionCount + 1);
  };

  const switchToFocus = () => {
    if (currentSessionType === "Focus") return;

    if (!timerRunning) return updateFocusDurationAndReset();

    if (confirm(confirmationMessage)) {
      updateFocusDurationAndReset();
    }
  };

  const switchToShortBreak = () => {
    if (currentSessionType === "Short Break") return;

    if (!timerRunning) return updateShortBreakDurationAndReset();

    if (confirm(confirmationMessage)) {
      updateShortBreakDurationAndReset();
    }
  };

  const switchToLongBreak = () => {
    if (currentSessionType === "Long Break") return;

    if (!timerRunning) return updateLongBreakDurationAndReset();

    if (confirm(confirmationMessage)) {
      updateLongBreakDurationAndReset();
    }
  };

  const resetTimer = (newStartTime: number) => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }

    setTimerRunning(false);
    setTimerPaused(true);

    timerEndTimeRef.current = null;
    saveToLocalStorage("timerEndTime", null);

    setStartTimeInMinutes(newStartTime);
    setRemainingTimeInSeconds(convertMinutesToSeconds(newStartTime));
  };

  return {
    switchSessionType,
    switchToFocus,
    switchToShortBreak,
    switchToLongBreak,
  };
};

export default useSessionSwitch;
