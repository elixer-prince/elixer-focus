import useCountdownContext from "@/features/countdown-timer/hooks/useCountdownContext";
import { dispatchTimerCommand } from "@/features/countdown-timer/services/timer-coordinator";
import { useLastCompletedSession } from "@/features/countdown-timer/stores/session-history-store";
import { useTimerPaused } from "@/features/countdown-timer/stores/countdown-store";
import { clearIntervalIfItExists } from "@/utils/interval";
import { playSound } from "@/utils/sound";

const usePauseCountdown = () => {
  const {
    timerOffClickSoundEffectRef,
    timerIntervalRef,
    sessionProgressIntervalRef,
    timerEndTimeRef,
  } = useCountdownContext();

  const timerPaused = useTimerPaused();
  const lastCompletedSession = useLastCompletedSession();

  const pauseCountdown = () => {
    if (timerPaused || lastCompletedSession) return;

    playSound(timerOffClickSoundEffectRef.current);
    dispatchTimerCommand({ type: "pause" });
    timerEndTimeRef.current = null;
    clearIntervalIfItExists(timerIntervalRef);
    clearIntervalIfItExists(sessionProgressIntervalRef);
  };

  return { pauseCountdown };
};

export default usePauseCountdown;
