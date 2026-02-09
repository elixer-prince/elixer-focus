import useCountdownInterval from "@/hooks/countdown-timer/useCountdownInterval";
import { useCountdownTimerContext } from "@/stores/countdown-timer/Context.tsx";
import {
  useSetTimerPaused,
  useTimerPaused,
} from "@/stores/countdown-timer/store.ts";
import { playSound } from "@/utils/sound";

const usePauseCountdown = () => {
  const { timerOffClickSoundEffectRef } = useCountdownTimerContext();
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
