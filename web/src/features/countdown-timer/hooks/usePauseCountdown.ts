import useCountdownContext from "@/features/countdown-timer/hooks/useCountdownContext";
import {
  useRemainingTimeInSeconds,
  useSetTimerPaused,
  useTimerPaused,
} from "@/features/countdown-timer/stores/countdown-store";
import { clearIntervalIfItExists } from "@/utils/interval";
import { playSound } from "@/utils/sound";
import { saveToLocalStorage } from "@/utils/storage";

const usePauseCountdown = () => {
  const {
    timerOffClickSoundEffectRef,
    timerIntervalRef,
    sessionProgressIntervalRef,
    timerEndTimeRef,
  } = useCountdownContext();

  const timerPaused = useTimerPaused();
  const remainingTimeInSeconds = useRemainingTimeInSeconds();
  const setTimerPaused = useSetTimerPaused();

  const pauseCountdown = () => {
    if (timerPaused) return;

    playSound(timerOffClickSoundEffectRef.current);
    setTimerPaused(true);
    saveToLocalStorage("timerPausedRemainingTime", remainingTimeInSeconds);
    timerEndTimeRef.current = null;
    saveToLocalStorage("timerEndTime", null);
    clearIntervalIfItExists(timerIntervalRef);
    clearIntervalIfItExists(sessionProgressIntervalRef);
  };

  return { pauseCountdown };
};

export default usePauseCountdown;
