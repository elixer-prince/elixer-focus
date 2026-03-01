import useCountdownContext from "@/features/countdown-timer/hooks/useCountdownContext";
import {
  useSetTimerPaused,
  useTimerPaused,
} from "@/stores/countdown-timer/store";
import { clearIntervalIfItExists } from "@/utils/interval";
import { playSound } from "@/utils/sound";

const usePauseCountdown = () => {
  const { timerOffClickSoundEffectRef, timerIntervalRef } =
    useCountdownContext();

  const timerPaused = useTimerPaused();
  const setTimerPaused = useSetTimerPaused();

  const pauseCountdown = () => {
    if (timerPaused) return;

    playSound(timerOffClickSoundEffectRef.current);
    setTimerPaused(true);
    clearIntervalIfItExists(timerIntervalRef);
  };

  return { pauseCountdown };
};

export default usePauseCountdown;
