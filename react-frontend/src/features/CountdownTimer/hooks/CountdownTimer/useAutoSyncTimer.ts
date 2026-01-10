import { useCountdownTimerContext } from "@features/CountdownTimer/stores/CountdownTimerContext";
import { useSessionContext } from "@features/CountdownTimer/stores/SessionContext";
import { convertMinutesToSeconds } from "@utils/conversion";
import { saveToLocalStorage } from "@utils/storage";
import { useEffect } from "react";

/**
 * Automatically syncs the timer duration with current session settings
 * when the timer is not running. This ensures the timer always shows
 * the correct duration for the current session type.
 */
const useAutoSyncTimer = () => {
    const {
        currentSessionType,
        focusDuration,
        shortBreakDuration,
        longBreakDuration,
    } = useSessionContext();

    const {
        timerRunning,
        timerPaused,
        startTimeInMinutes,
        setStartTimeInMinutes,
        setRemainingTimeInSeconds,
    } = useCountdownTimerContext();

    useEffect(() => {
        // Only sync if timer is NOT actively running
        // timerPaused = true means timer is stopped
        // timerRunning = false means timer isn't counting down
        const isTimerIdle = !timerRunning || timerPaused;

        if (!isTimerIdle) {
            // Timer is running - don't change it!
            return;
        }

        // Get the correct duration for the current session type
        let correctDuration;

        switch (currentSessionType) {
            case "Focus":
                correctDuration = focusDuration;
                break;
            case "Short Break":
                correctDuration = shortBreakDuration;
                break;
            case "Long Break":
                correctDuration = longBreakDuration;
                break;
            default:
                correctDuration = focusDuration;
        }

        // Only update if the duration has actually changed
        if (correctDuration !== startTimeInMinutes) {
            // Update timer state
            setStartTimeInMinutes(correctDuration);
            setRemainingTimeInSeconds(convertMinutesToSeconds(correctDuration));

            // Persist to localStorage
            saveToLocalStorage("startTimeInMinutes", correctDuration);
            saveToLocalStorage(
                "remainingTimeInSeconds",
                convertMinutesToSeconds(correctDuration),
            );

            console.log(
                `Auto-synced timer: ${currentSessionType} = ${correctDuration}min`,
            );
        }
    }, [
        focusDuration,
        shortBreakDuration,
        longBreakDuration,
        currentSessionType,
        timerRunning,
        timerPaused,
        startTimeInMinutes,
        setStartTimeInMinutes,
        setRemainingTimeInSeconds,
    ]);
};

export default useAutoSyncTimer;
