import useCountdownInterval from "@/hooks/countdown-timer/useCountdownInterval";
import useCountdownContext from "@/hooks/countdown-timer/useCountdownContext";
import {
  useSetTimerPaused,
  useTimerPaused,
} from "@/stores/countdown-timer/CountdownStore.ts";
import { playSound } from "@/utils/sound";

const usePauseCountdown = () => {
  const { timerOffClickSoundEffectRef } = useCountdownContext();
  const { clearIntervalIfItExists } = useCountdownInterval();

  const timerPaused = useTimerPaused();
  const setTimerPaused = useSetTimerPaused();

  // * Locked * //
  const pauseCountdown = () => {
    if (timerPaused) return;

    playSound(timerOffClickSoundEffectRef.current);
    setTimerPaused(true);
    clearIntervalIfItExists();
  };

  return { pauseCountdown };
};

export default usePauseCountdown;
