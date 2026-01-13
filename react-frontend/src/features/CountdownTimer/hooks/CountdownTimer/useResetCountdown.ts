import { useCountdownTimerContext } from "@features/CountdownTimer/stores/CountdownTimerContext";
import { useSessionContext } from "@features/CountdownTimer/stores/SessionContext";
import { convertMinutesToSeconds } from "@utils/conversion";
import { playSound } from "@utils/sound";
import { saveToLocalStorage } from "@utils/storage";

const useResetCountdown = (): {
    resetCountdown: () => void;
    resetCountdownWithSound: () => void;
} => {
    const {
        resetTimerSoundEffect,
        setRemainingTimeInSeconds,
        startTimeInMinutes,
        timerInterval,
        timerEndTime,
        timerRunning,
        setTimerRunning,
        setTimerPaused,
        setStartTimeInMinutes, // ADD THIS
    } = useCountdownTimerContext();

    const {
        currentSessionType,
        focusDuration,
        shortBreakDuration,
        longBreakDuration,
    } = useSessionContext(); // ADD THIS

    const resetCountdown = () => {
        if (timerInterval.current) clearInterval(timerInterval.current);

        timerEndTime.current = null;

        // GET THE CORRECT DURATION FOR CURRENT SESSION
        let currentDuration = startTimeInMinutes; // fallback to existing

        switch (currentSessionType) {
            case "Focus":
                currentDuration = focusDuration;
                break;
            case "Short Break":
                currentDuration = shortBreakDuration;
                break;
            case "Long Break":
                currentDuration = longBreakDuration;
                break;
        }

        // ALSO UPDATE startTimeInMinutes to stay in sync
        setStartTimeInMinutes(currentDuration);
        saveToLocalStorage("startTimeInMinutes", currentDuration);

        const initialTime = convertMinutesToSeconds(currentDuration); // Use currentDuration

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
