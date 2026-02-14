import useCountdownTimerStorage from "@/hooks/countdown-timer/useCountdownStorage";
import usePageTitle from "@/hooks/usePageTitle";
import { useTimerRunning } from "@/stores/countdown-timer/countdown-store";
import {
  useCurrentSessionCount,
  useCurrentSessionType,
  useFocusDuration,
  useLongBreakDuration,
  useSessionCountLimit,
  useSetCurrentSessionCount,
  useSetCurrentSessionType,
  useShortBreakDuration,
} from "@/stores/countdown-timer/session-store";
import type { CountdownSession } from "@/types/countdown-timer";

const useSessionSwitch = () => {
  const { resetPageTitle } = usePageTitle();

  const focusDuration = useFocusDuration();
  const shortBreakDuration = useShortBreakDuration();
  const longBreakDuration = useLongBreakDuration();
  const currentSessionType = useCurrentSessionType();
  const currentSessionCount = useCurrentSessionCount();
  const sessionCountLimit = useSessionCountLimit();
  const setCurrentSessionType = useSetCurrentSessionType();
  const setCurrentSessionCount = useSetCurrentSessionCount();

  const timerRunning = useTimerRunning();
  const { resetTimerStorage } = useCountdownTimerStorage();

  const confirmationMessage =
    "Switching sessions will reset the current timer. Do you want to proceed?";

  const autoSwitchSessionType = () => {
    switch (currentSessionType) {
      case "Short Break":
        updateTimerDurationAndReset("Focus", focusDuration);
        break;
      case "Long Break":
        updateTimerDurationAndReset("Focus", focusDuration);
        break;
      default:
        handleBreakSwitching();
    }
    resetPageTitle();
  };

  const updateTimerDurationAndReset = (
    sessionType: CountdownSession,
    sessionDuration: number,
  ) => {
    setCurrentSessionType(sessionType);
    resetTimerStorage(sessionDuration);
  };

  const updateSessionCount = (newSessionCount: number) => {
    setCurrentSessionCount(newSessionCount);
  };

  const handleBreakSwitching = () => {
    if (currentSessionCount + 1 >= sessionCountLimit) {
      updateTimerDurationAndReset("Long Break", longBreakDuration);
      return updateSessionCount(0);
    }

    updateTimerDurationAndReset("Short Break", shortBreakDuration);
    setCurrentSessionCount(currentSessionCount + 1);
  };

  const switchToFocus = () => {
    if (currentSessionType === "Focus") return;

    if (!timerRunning)
      return updateTimerDurationAndReset("Focus", focusDuration);

    if (confirm(confirmationMessage)) {
      updateTimerDurationAndReset("Focus", focusDuration);
      resetPageTitle();
    }
  };

  const switchToShortBreak = () => {
    if (currentSessionType === "Short Break") return;

    if (!timerRunning)
      return updateTimerDurationAndReset("Short Break", shortBreakDuration);

    if (confirm(confirmationMessage)) {
      updateTimerDurationAndReset("Short Break", shortBreakDuration);
      resetPageTitle();
    }
  };

  const switchToLongBreak = () => {
    if (currentSessionType === "Long Break") return;

    if (!timerRunning)
      return updateTimerDurationAndReset("Long Break", longBreakDuration);

    if (confirm(confirmationMessage)) {
      updateTimerDurationAndReset("Long Break", longBreakDuration);
      resetPageTitle();
    }
  };

  return {
    autoSwitchSessionType,
    switchToFocus,
    switchToShortBreak,
    switchToLongBreak,
  };
};

export default useSessionSwitch;
