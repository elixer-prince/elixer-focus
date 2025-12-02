import { playSound } from "@utils/sound.ts";
import { convertMinutesToSeconds } from "@utils/conversion.ts";
import { saveToLocalStorage } from "@utils/storage.ts";
import useCountdownTimerContext from "@features/CountdownTimer/hooks/useCountdownTimerContext.tsx";

const UseResetCountdown = () => {
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
        // Clear the interval if it's running
        if (timerInterval.current) clearInterval(timerInterval.current);

        // Clear all timer refs
        timeRemainingOnPause.current = null;
        timerEndTime.current = null;

        // Reset to initial state
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
        const wasRunning = timerRunning;
        resetCountdown();
        if (wasRunning) playSound(resetTimerSoundEffect.current);
    };

    return { resetCountdown, resetCountdownWithSound };
};

export default UseResetCountdown;
