import useStartCountdown from "@features/CountdownTimer/hooks/CountdownTimer/useStartCountdown.tsx";
import usePauseCountdown from "@features/CountdownTimer/hooks/CountdownTimer/usePauseCountdown.tsx";
import useCountdownTimerContext from "@features/CountdownTimer/hooks/CountdownTimer/useCountdownTimerContext.tsx";

const useHandleCountdownState = () => {
    const { timerPaused, remainingTimeInSeconds } = useCountdownTimerContext();
    const { startCountdownWithSound } = useStartCountdown();
    const { pauseCountdown } = usePauseCountdown();

    const isEndingSoon = remainingTimeInSeconds <= 10;

    const handleCountdownState = () => {
        if (timerPaused) return startCountdownWithSound();
        pauseCountdown();
    };

    return { handleCountdownState, isEndingSoon };
};

export default useHandleCountdownState;
