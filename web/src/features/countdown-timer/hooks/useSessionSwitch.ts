import useCountdownTimerStorage from "@/features/countdown-timer/hooks/useCountdownStorage";
import { dispatchTimerCommand } from "@/features/countdown-timer/services/timer-coordinator";
import { useLastCompletedSession } from "@/features/countdown-timer/stores/session-history-store";
import { useTimerRunning } from "@/features/countdown-timer/stores/countdown-store";
import {
  useCurrentSessionCount,
  useCurrentSessionType,
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
  const currentSessionType = useCurrentSessionType();
  const currentSessionCount = useCurrentSessionCount();
  const sessionCountLimit = useSessionCountLimit();
  const lastCompletedSession = useLastCompletedSession();
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
    resetTimerStorage(sessionDuration, false);
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
    if (currentSessionType === "Focus" || lastCompletedSession) return;

    if (!timerRunning) {
      dispatchTimerCommand({ type: "switch-session", sessionType: "Focus" });
      return resetPageTitle();
    }

    if (confirm(confirmationMessage)) {
      dispatchTimerCommand({ type: "switch-session", sessionType: "Focus" });
      resetPageTitle();
    }
  };

  const switchToShortBreak = () => {
    if (currentSessionType === "Short Break" || lastCompletedSession) return;

    if (!timerRunning) {
      dispatchTimerCommand({
        type: "switch-session",
        sessionType: "Short Break",
      });
      return resetPageTitle();
    }

    if (confirm(confirmationMessage)) {
      dispatchTimerCommand({
        type: "switch-session",
        sessionType: "Short Break",
      });
      resetPageTitle();
    }
  };

  const switchToLongBreak = () => {
    if (currentSessionType === "Long Break" || lastCompletedSession) return;

    if (!timerRunning) {
      dispatchTimerCommand({
        type: "switch-session",
        sessionType: "Long Break",
      });
      return resetPageTitle();
    }

    if (confirm(confirmationMessage)) {
      dispatchTimerCommand({
        type: "switch-session",
        sessionType: "Long Break",
      });
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
