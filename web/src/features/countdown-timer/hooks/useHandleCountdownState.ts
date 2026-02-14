import usePauseCountdown from "@/hooks/countdown-timer/usePauseCountdown";
import useStartCountdown from "@/hooks/countdown-timer/useStartCountdown";
import {
  useRemainingTimeInSeconds,
  useTimerPaused,
} from "@/stores/countdown-timer/countdown-store";

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
