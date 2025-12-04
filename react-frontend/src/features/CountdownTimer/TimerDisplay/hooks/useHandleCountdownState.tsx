import useStartCountdown from "@features/CountdownTimer/hooks/useStartCountdown.tsx";
import usePauseCountdown from "@features/CountdownTimer/hooks/usePauseCountdown.tsx";
import useCountdownTimerContext from "@features/CountdownTimer/hooks/useCountdownTimerContext.tsx";

const useHandleCountdownState = () => {
    const { timerPaused } = useCountdownTimerContext();
    const { startCountdownWithSound } = useStartCountdown();
    const { pauseCountdown } = usePauseCountdown();

    const handleCountdownState = () => {
        if (timerPaused) return startCountdownWithSound();
        pauseCountdown();
    };

    return { handleCountdownState };
};

export default useHandleCountdownState;
