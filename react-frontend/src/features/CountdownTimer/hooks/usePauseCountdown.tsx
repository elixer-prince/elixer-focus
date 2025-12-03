import useCountdownTimerContext from "@features/CountdownTimer/hooks/useCountdownTimerContext.tsx";
import { playSound } from "@utils/sound.ts";
import { saveToLocalStorage } from "@utils/storage.ts";

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
        setTimerPaused(() => {
            saveToLocalStorage("timerPaused", true);
            return true;
        });

        timeRemainingOnPause.current = remainingTimeInSeconds;

        if (timerInterval.current) clearInterval(timerInterval.current);
    };

    return { pauseCountdown };
};

export default UsePauseCountdown;

