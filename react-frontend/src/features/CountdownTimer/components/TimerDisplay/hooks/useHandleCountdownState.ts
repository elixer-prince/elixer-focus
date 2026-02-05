import usePauseCountdown from "@features/CountdownTimer/hooks/usePauseCountdown.ts";
import useStartCountdown from "@features/CountdownTimer/hooks/useStartCountdown.ts";
import { useCountdownTimerContext } from "@features/CountdownTimer/stores/CountdownTimerContext.tsx";

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
