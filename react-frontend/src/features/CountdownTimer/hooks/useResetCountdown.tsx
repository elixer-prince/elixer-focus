import { playSound } from "@utils/sound.ts";
import { convertMinutesToSeconds } from "@utils/conversion.ts";
import { saveToLocalStorage } from "@utils/storage.ts";
import useCountdownTimerContext from "@features/CountdownTimer/hooks/useCountdownTimerContext.tsx";

const useResetCountdown = () => {
    const {
        resetTimerSoundEffect,
        setRemainingTimeInSeconds,
        startTimeInMinutes,
        timerInterval,
        timeRemainingOnPause,
        timerEndTime,
        timerRunning,
        setTimerRunning,
        setTimerPaused,
    } = useCountdownTimerContext();

    const resetCountdown = () => {
        if (timerInterval.current) clearInterval(timerInterval.current);

        timeRemainingOnPause.current = null;
        timerEndTime.current = null;

        const initialTime = convertMinutesToSeconds(startTimeInMinutes);

        setTimerPaused(() => {
            saveToLocalStorage("timerPaused", true);
            return true;
        });

        setTimerRunning(() => {
            saveToLocalStorage("timerRunning", false);
            return false;
        });

        setRemainingTimeInSeconds(() => {
            saveToLocalStorage("remainingTimeInSeconds", initialTime);
            return initialTime;
        });

        // Clear localStorage for refs
        saveToLocalStorage("timerEndTime", null);
        saveToLocalStorage("timeRemainingOnPause", null);
    };

    const resetCountdownWithSound = () => {
        if (!timerRunning) return alert("The timer is not running.");

        if (confirm("Are you sure you want to reset the countdown?")) {
            resetCountdown();
            playSound(resetTimerSoundEffect.current);
        }
    };

    return { resetCountdown, resetCountdownWithSound };
};

export default useResetCountdown;
