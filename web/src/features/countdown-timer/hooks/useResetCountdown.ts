import useCountdownContext from "@/features/countdown-timer/hooks/useCountdownContext";
import { dispatchTimerCommand } from "@/features/countdown-timer/services/timer-coordinator";
import { useLastCompletedSession } from "@/features/countdown-timer/stores/session-history-store";
import usePageTitle from "@/hooks/usePageTitle";
import { useTimerRunning } from "@/features/countdown-timer/stores/countdown-store";
import { clearIntervalIfItExists } from "@/utils/interval";
import { playSound } from "@/utils/sound";

const useResetCountdown = () => {
  const {
    resetTimerSoundEffectRef,
    hasPlayedEndBeepRef,
    timerIntervalRef,
    sessionProgressIntervalRef,
    timerEndTimeRef,
  } = useCountdownContext();
  const { resetPageTitle } = usePageTitle();

  const timerRunning = useTimerRunning();
  const lastCompletedSession = useLastCompletedSession();

  const resetCountdown = () => {
    clearIntervalIfItExists(timerIntervalRef);
    clearIntervalIfItExists(sessionProgressIntervalRef);

    // Reset the beep flag so a new timer cycle can play the beep
    hasPlayedEndBeepRef.current = false;
    timerEndTimeRef.current = null;
    dispatchTimerCommand({ type: "reset" });
    resetPageTitle();
  };

  const resetCountdownWithSound = () => {
    if (!timerRunning || lastCompletedSession) return;

    // TODO: Implement this as an overlay
    if (confirm("Are you sure you want to reset the countdown?")) {
      resetCountdown();
      playSound(resetTimerSoundEffectRef.current);
    }
  };

  return { resetCountdown, resetCountdownWithSound };
};

export default useResetCountdown;
