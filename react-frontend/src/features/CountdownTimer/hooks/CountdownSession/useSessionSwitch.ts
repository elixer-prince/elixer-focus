import { useCountdownTimerContext } from "@features/CountdownTimer/stores/CountdownTimerContext";
import { useSessionContext } from "@features/CountdownTimer/stores/SessionContext";
import { convertMinutesToSeconds } from "@utils/conversion";
import { saveToLocalStorage } from "@utils/storage";

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
        timerInterval,
        timerEndTime,
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
            updateSessionCount(0);
        } else {
            updateShortBreakDurationAndReset();

            setCurrentSessionCount((sessionCount) => {
                const newSessionCount = sessionCount + 1;

                saveToLocalStorage("currentSessionCount", newSessionCount);
                return newSessionCount;
            });
        }
    };

    const switchToFocus = () => {
        if (currentSessionType === "Focus") return;

        if (timerRunning) {
            if (confirm(confirmationMessage)) {
                updateFocusDurationAndReset();
            }
        } else {
            updateFocusDurationAndReset();
        }
    };

    const switchToShortBreak = () => {
        if (currentSessionType === "Short Break") return;

        if (timerRunning) {
            if (confirm(confirmationMessage)) {
                updateShortBreakDurationAndReset();
            }
        } else {
            updateShortBreakDurationAndReset();
        }
    };

    const switchToLongBreak = () => {
        if (currentSessionType === "Long Break") return;

        if (timerRunning) {
            if (confirm(confirmationMessage)) {
                updateLongBreakDurationAndReset();
            }
        } else {
            updateLongBreakDurationAndReset();
        }
    };

    const resetTimer = (newStartTime: number) => {
        if (timerInterval.current) {
            clearInterval(timerInterval.current);
            timerInterval.current = null;
        }

        setTimerRunning(() => {
            saveToLocalStorage("timerRunning", false);
            return false;
        });

        setTimerPaused(() => {
            saveToLocalStorage("timerPaused", true);
            return true;
        });

        timerEndTime.current = null;
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
