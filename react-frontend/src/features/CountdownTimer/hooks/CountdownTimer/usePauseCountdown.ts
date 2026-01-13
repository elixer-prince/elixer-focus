import { useCountdownTimerContext } from "@features/CountdownTimer/stores/CountdownTimerContext";
import { playSound } from "@utils/sound";
import { saveToLocalStorage } from "@utils/storage";

const usePauseCountdown = (): {
    pauseCountdown: () => void;
} => {
    const {
        timerIntervalRef,
        timerOffClickSoundEffectRef,
        timerPaused,
        setTimerPaused,
    } = useCountdownTimerContext();

    const pauseCountdown = () => {
        if (timerPaused) return;

        playSound(timerOffClickSoundEffectRef.current);
        setTimerPaused(() => {
            saveToLocalStorage("timerPaused", true);
            return true;
        });

        if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };

    return { pauseCountdown };
};

export default usePauseCountdown;
