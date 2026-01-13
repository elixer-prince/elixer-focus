import useEndTicking from "@features/CountdownTimer/hooks/CountdownTimer/useEndTicking";
import usePauseCountdown from "@features/CountdownTimer/hooks/CountdownTimer/usePauseCountdown";
import useResetCountdown from "@features/CountdownTimer/hooks/CountdownTimer/useResetCountdown";
import useRunInterval from "@features/CountdownTimer/hooks/CountdownTimer/useRunInterval";
import useSkipCountdown from "@features/CountdownTimer/hooks/CountdownTimer/useSkipCountdown";
import useStartCountdown from "@features/CountdownTimer/hooks/CountdownTimer/useStartCountdown";

const useCountdownTimer = () => {
    const { startEndTicking, stopEndTicking } = useEndTicking();
    const { pauseCountdown } = usePauseCountdown();
    const { resetCountdown, resetCountdownWithSound } = useResetCountdown();
    const { skipCountdown } = useSkipCountdown();
    const { startCountdown, startCountdownWithSound } = useStartCountdown();
    const { runInterval } = useRunInterval();

    return {
        startEndTicking,
        stopEndTicking,
        pauseCountdown,
        resetCountdown,
        resetCountdownWithSound,
        skipCountdown,
        startCountdown,
        startCountdownWithSound,
        runInterval,
    };
};

export default useCountdownTimer;
