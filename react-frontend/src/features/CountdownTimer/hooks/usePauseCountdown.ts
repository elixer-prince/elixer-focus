import { useCountdownTimerContext } from "@/features/CountdownTimer/stores/CountdownTimerContext";
import {
  useSetTimerPaused,
  useTimerPaused,
} from "@/features/CountdownTimer/stores/CountdownTimerStore";
import { playSound } from "@/utils/sound";

const usePauseCountdown = (): {
  pauseCountdown: () => void;
} => {
  const { timerIntervalRef, timerOffClickSoundEffectRef } =
    useCountdownTimerContext();

  const timerPaused = useTimerPaused();
  const setTimerPaused = useSetTimerPaused();

  const pauseCountdown = () => {
    if (timerPaused) return;

    playSound(timerOffClickSoundEffectRef.current);
    setTimerPaused(true);

    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
  };

  return { pauseCountdown };
};

export default usePauseCountdown;
