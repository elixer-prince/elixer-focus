import useStartCountdown from "./useStartCountdown.tsx";
import useCountdownTimerChecks from "./useCountdownTimerChecks.tsx";
import usePauseCountdown from "./usePauseCountdown.tsx";

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
