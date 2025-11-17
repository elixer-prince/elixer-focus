import { playSound } from "@utils/sound.ts";
import useCountdownTimerContext from "@features/CountdownTimer/hooks/useCountdownTimerContext.tsx";

const UsePauseCountdown = () => {
    const {
        timerInterval,
        remainingTimeInSeconds,
        timeRemainingOnPause,
        timerOffClickSoundEffect,
        timerPaused,
        setTimerPaused,
    } = useCountdownTimerContext();

    const pauseCountdown = () => {
        if (timerPaused) return;

        playSound(timerOffClickSoundEffect.current);
        setTimerPaused(true);

        timeRemainingOnPause.current = remainingTimeInSeconds;

        if (timerInterval.current) clearInterval(timerInterval.current);
    };

    return { pauseCountdown };
};

export default UsePauseCountdown;
