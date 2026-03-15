import useCountdownTimerStorage from "@/features/countdown-timer/hooks/useCountdownStorage";
import { useTimerRunning } from "@/features/countdown-timer/stores/countdown-store";
import {
  useCurrentSessionCount,
  useCurrentSessionType,
  useCustomSessionDuration,
  useFocusDuration,
  useIncrementCurrentSessionCount,
  useLongBreakDuration,
  useResetCurrentSessionCount,
  useSessionCountLimit,
  useSetCurrentSessionType,
  useShortBreakDuration,
} from "@/features/countdown-timer/stores/session-store";
import type { CountdownSession } from "@/features/countdown-timer/types/session";
import usePageTitle from "@/hooks/usePageTitle";

const useSessionSwitch = () => {
  const { resetPageTitle } = usePageTitle();

  const focusDuration = useFocusDuration();
  const shortBreakDuration = useShortBreakDuration();
  const longBreakDuration = useLongBreakDuration();
  const customSessionDuration = useCustomSessionDuration();
  const currentSessionType = useCurrentSessionType();
  const currentSessionCount = useCurrentSessionCount();
  const sessionCountLimit = useSessionCountLimit();
  const setCurrentSessionType = useSetCurrentSessionType();
  const incrementCurrentSessionCount = useIncrementCurrentSessionCount();
  const resetCurrentSessionCount = useResetCurrentSessionCount();

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
        resetCurrentSessionCount();
        break;
      case "Custom":
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

  const handleBreakSwitching = () => {
    if (currentSessionCount + 1 >= sessionCountLimit) {
      updateTimerDurationAndReset("Long Break", longBreakDuration);
      return resetCurrentSessionCount();
    }

    updateTimerDurationAndReset("Short Break", shortBreakDuration);
    incrementCurrentSessionCount();
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

  const switchToCustom = () => {
    if (currentSessionType === "Custom") return;

    if (!timerRunning)
      return updateTimerDurationAndReset("Custom", customSessionDuration);

    if (confirm(confirmationMessage)) {
      updateTimerDurationAndReset("Custom", customSessionDuration);
      resetPageTitle();
    }
  };

  const updateCustomDurationAndReset = (value: number) => {
    if (currentSessionType === "Custom") {
      updateTimerDurationAndReset("Custom", value);
    }
  };

  return {
    autoSwitchSessionType,
    switchToFocus,
    switchToShortBreak,
    switchToLongBreak,
    switchToCustom,
    updateCustomDurationAndReset,
  };
};

export default useSessionSwitch;
