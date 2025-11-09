import useStartCountdown from "@features/countdown-timer/hooks/useStartCountdown.tsx";
import useCountdownTimerChecks from "@features/countdown-timer/hooks/useCountdownTimerChecks.tsx";
import usePauseCountdown from "@features/countdown-timer/hooks/usePauseCountdown.tsx";

const useHandleCountdownState = () => {
    const { startCountdownWithSound } = useStartCountdown();
    const { pauseCountdown } = usePauseCountdown();
    const { countdownTimerIsPaused } = useCountdownTimerChecks();

    const handleCountdownState = () => {
        if (countdownTimerIsPaused()) return startCountdownWithSound();
        pauseCountdown();
    };

    return { handleCountdownState };
};

export default useHandleCountdownState;
