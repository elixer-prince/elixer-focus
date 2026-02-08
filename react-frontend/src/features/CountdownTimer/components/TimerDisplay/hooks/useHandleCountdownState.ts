import usePauseCountdown from "@/features/CountdownTimer/hooks/usePauseCountdown.ts";
import useStartCountdown from "@/features/CountdownTimer/hooks/useStartCountdown.ts";
import { useCountdownTimerContext } from "@/features/CountdownTimer/stores/CountdownTimerContext.tsx";
import {
  useRemainingTimeInSeconds,
  useTimerPaused,
} from "@/features/CountdownTimer/stores/CountdownTimerStore";

const useHandleCountdownState = () => {
  const { startCountdownWithSound } = useStartCountdown();
  const { pauseCountdown } = usePauseCountdown();

  const timerPaused = useTimerPaused();
  const remainingTimeInSeconds = useRemainingTimeInSeconds();

  const isEndingSoon = remainingTimeInSeconds <= 10;

  const handleCountdownState = () => {
    if (timerPaused) return startCountdownWithSound();
    pauseCountdown();
  };

  return { handleCountdownState, isEndingSoon };
};

export default useHandleCountdownState;
