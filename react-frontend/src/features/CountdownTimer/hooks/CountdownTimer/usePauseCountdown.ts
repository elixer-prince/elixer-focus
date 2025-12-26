import useCountdownTimerContext from "@features/CountdownTimer/hooks/CountdownTimer/useCountdownTimerContext";
import { playSound } from "@utils/sound";
import { saveToLocalStorage } from "@utils/storage";

const UsePauseCountdown = () => {
    const {
        timerInterval,
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

        if (timerInterval.current) clearInterval(timerInterval.current);
    };

    return { pauseCountdown };
};

export default UsePauseCountdown;
