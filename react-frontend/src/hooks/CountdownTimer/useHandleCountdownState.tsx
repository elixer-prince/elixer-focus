import useStartCountdown from "@hooks/CountdownTimer/useStartCountdown";
import useCountdownTimerChecks from "@hooks/CountdownTimer/useCountdownTimerChecks";
import usePauseCountdown from "@hooks/CountdownTimer/usePauseCountdown";

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
