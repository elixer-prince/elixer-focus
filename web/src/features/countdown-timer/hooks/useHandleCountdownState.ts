import usePauseCountdown from "@/features/countdown-timer/hooks/usePauseCountdown";
import useStartCountdown from "@/features/countdown-timer/hooks/useStartCountdown";
import {
  useRemainingTimeInSeconds,
  useTimerPaused,
} from "@/stores/countdown-timer/store";

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
