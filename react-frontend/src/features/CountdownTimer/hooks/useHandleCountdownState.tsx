import useStartCountdown from "@features/CountdownTimer/hooks/useStartCountdown.tsx";
import useCountdownTimerChecks from "@features/CountdownTimer/hooks/useCountdownTimerChecks.tsx";
import usePauseCountdown from "@features/CountdownTimer/hooks/usePauseCountdown.tsx";

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
