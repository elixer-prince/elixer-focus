import { useCountdownTimerContext } from "@/features/CountdownTimer/stores/CountdownTimerContext.tsx";
import { useSessionContext } from "@/features/CountdownTimer/stores/SessionContext.tsx";
import { convertMinutesToSeconds } from "@/utils/conversion.ts";
import { saveToLocalStorage } from "@/utils/storage.ts";

const useSessionSwitch = () => {
    const {
        focusDuration,
        shortBreakDuration,
        longBreakDuration,
        currentSessionType,
        currentSessionCount,
        sessionCountLimit,
        setCurrentSessionType,
        setCurrentSessionCount,
    } = useSessionContext();

    const {
        setStartTimeInMinutes,
        setRemainingTimeInSeconds,
        setTimerPaused,
        setTimerRunning,
        timerRunning,
        timerIntervalRef,
        timerEndTimeRef,
    } = useCountdownTimerContext();

    const confirmationMessage =
        "Switching sessions will reset the current timer. Do you want to proceed?";

    const switchSessionType = () => {
        switch (currentSessionType) {
            case "Short Break":
                updateFocusDurationAndReset();
                break;
            case "Long Break":
                updateFocusDurationAndReset();
                break;
            default:
                handleBreakSwitching();
        }
    };

    const updateFocusDurationAndReset = () => {
        setCurrentSessionType(() => {
            const newSessionType = "Focus";

            saveToLocalStorage("currentSessionType", newSessionType);
            return newSessionType;
        });

        resetTimer(focusDuration);
    };

    const updateShortBreakDurationAndReset = () => {
        setCurrentSessionType(() => {
            const newSessionType = "Short Break";

            saveToLocalStorage("currentSessionType", newSessionType);
            return newSessionType;
        });

        resetTimer(shortBreakDuration);
    };

    const updateLongBreakDurationAndReset = () => {
        setCurrentSessionType(() => {
            const newSessionType = "Long Break";

            saveToLocalStorage("currentSessionType", newSessionType);
            return newSessionType;
        });

        resetTimer(longBreakDuration);
    };

    const updateSessionCount = (newSessionCount: number) => {
        setCurrentSessionCount(() => {
            saveToLocalStorage("currentSessionCount", newSessionCount);
            return newSessionCount;
        });
    };

    const handleBreakSwitching = () => {
        if (currentSessionCount + 1 >= sessionCountLimit) {
            updateLongBreakDurationAndReset();
            return updateSessionCount(0);
        }

        updateShortBreakDurationAndReset();

        setCurrentSessionCount((sessionCount) => {
            const newSessionCount = sessionCount + 1;

            saveToLocalStorage("currentSessionCount", newSessionCount);
            return newSessionCount;
        });
    };

    const switchToFocus = () => {
        if (currentSessionType === "Focus") return;

        if (!timerRunning) return updateFocusDurationAndReset();

        if (confirm(confirmationMessage)) {
            updateFocusDurationAndReset();
        }
    };

    const switchToShortBreak = () => {
        if (currentSessionType === "Short Break") return;

        if (!timerRunning) return updateShortBreakDurationAndReset();

        if (confirm(confirmationMessage)) {
            updateShortBreakDurationAndReset();
        }
    };

    const switchToLongBreak = () => {
        if (currentSessionType === "Long Break") return;

        if (!timerRunning) return updateLongBreakDurationAndReset();

        if (confirm(confirmationMessage)) {
            updateLongBreakDurationAndReset();
        }
    };

    const resetTimer = (newStartTime: number) => {
        if (timerIntervalRef.current) {
            clearInterval(timerIntervalRef.current);
            timerIntervalRef.current = null;
        }

        setTimerRunning(() => {
            saveToLocalStorage("timerRunning", false);
            return false;
        });

        setTimerPaused(() => {
            saveToLocalStorage("timerPaused", true);
            return true;
        });

        timerEndTimeRef.current = null;
        saveToLocalStorage("timerEndTime", null);

        setStartTimeInMinutes(() => {
            saveToLocalStorage("startTimeInMinutes", newStartTime);
            return newStartTime;
        });

        setRemainingTimeInSeconds(() => {
            const remainingSeconds = convertMinutesToSeconds(newStartTime);
            saveToLocalStorage("remainingTimeInSeconds", remainingSeconds);
            return remainingSeconds;
        });
    };

    return {
        switchSessionType,
        switchToFocus,
        switchToShortBreak,
        switchToLongBreak,
    };
};

export default useSessionSwitch;
