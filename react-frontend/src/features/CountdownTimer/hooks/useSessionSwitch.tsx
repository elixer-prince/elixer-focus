import useCountdownTimerContext from "@features/CountdownTimer/hooks/useCountdownTimerContext.tsx";
import useSessionContext from "@features/CountdownTimer/hooks/useSessionContext.tsx";
import { convertMinutesToSeconds } from "@utils/conversion.ts";
import { saveToLocalStorage } from "@utils/storage.ts";

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
                handleFocusSwitching();
                break;
            case "Long Break":
                handleFocusSwitching();
                break;
            default:
                handleBreakSwitching();
        }
    };

    const handleFocusSwitching = () => {
        setCurrentSessionType(() => {
            const newSessionType = "Focus";

            saveToLocalStorage("currentSessionType", newSessionType);
            return newSessionType;
        });

        const newStartTime = focusDuration;

        resetTimer(newStartTime);
    };

    const handleBreakSwitching = () => {
        if (currentSessionCount + 1 >= sessionCountLimit) {
            setCurrentSessionType(() => {
                const newSessionType = "Long Break";

                saveToLocalStorage("currentSessionType", newSessionType);
                return newSessionType;
            });

            const newStartTime = longBreakDuration;

            resetTimer(newStartTime);

            setCurrentSessionCount(() => {
                const newSessionCount = 0;

                saveToLocalStorage("currentSessionCount", newSessionCount);
                return newSessionCount;
            });
        } else {
            setCurrentSessionType(() => {
                const newSessionType = "Short Break";

                saveToLocalStorage("currentSessionType", newSessionType);
                return newSessionType;
            });

            const newStartTime = shortBreakDuration;

            resetTimer(newStartTime);

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
                setCurrentSessionType(() => {
                    const newSessionType = "Focus";

                    saveToLocalStorage("currentSessionType", newSessionType);
                    return newSessionType;
                });

                const newStartTime = focusDuration;

                resetTimer(newStartTime);
            }
        } else {
            setCurrentSessionType(() => {
                const newSessionType = "Focus";

                saveToLocalStorage("currentSessionType", newSessionType);
                return newSessionType;
            });

            const newStartTime = focusDuration;

            resetTimer(newStartTime);
        }
    };

    const switchToShortBreak = () => {
        if (currentSessionType === "Short Break") return;

        if (timerRunning) {
            if (confirm(confirmationMessage)) {
                setCurrentSessionType(() => {
                    const newSessionType = "Short Break";

                    saveToLocalStorage("currentSessionType", newSessionType);
                    return newSessionType;
                });

                const newStartTime = shortBreakDuration;

                resetTimer(newStartTime);
            }
        } else {
            setCurrentSessionType(() => {
                const newSessionType = "Short Break";

                saveToLocalStorage("currentSessionType", newSessionType);
                return newSessionType;
            });

            const newStartTime = shortBreakDuration;

            resetTimer(newStartTime);
        }
    };

    const switchToLongBreak = () => {
        if (currentSessionType === "Long Break") return;

        if (timerRunning) {
            if (confirm(confirmationMessage)) {
                setCurrentSessionType(() => {
                    const newSessionType = "Long Break";

                    saveToLocalStorage("currentSessionType", newSessionType);
                    return newSessionType;
                });

                const newStartTime = longBreakDuration;

                resetTimer(newStartTime);
            }
        } else {
            setCurrentSessionType(() => {
                const newSessionType = "Long Break";

                saveToLocalStorage("currentSessionType", newSessionType);
                return newSessionType;
            });

            const newStartTime = longBreakDuration;

            resetTimer(newStartTime);
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
