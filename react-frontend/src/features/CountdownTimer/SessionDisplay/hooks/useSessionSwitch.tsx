import useCountdownTimerContext from "@features/CountdownTimer/hooks/useCountdownTimerContext.tsx";
import useSessionContext from "@features/CountdownTimer/SessionDisplay/hooks/useSessionContext";
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

    const { setStartTimeInMinutes, setRemainingTimeInSeconds } =
        useCountdownTimerContext();

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

    const handleBreakSwitching = () => {
        if (currentSessionCount + 1 >= sessionCountLimit) {
            setCurrentSessionType(() => {
                const newSessionType = "Long Break";

                saveToLocalStorage("currentSessionType", newSessionType);
                return newSessionType;
            });

            const newStartTime = longBreakDuration;

            setStartTimeInMinutes(() => {
                saveToLocalStorage("startTimeInMinutes", newStartTime);
                return newStartTime;
            });

            setRemainingTimeInSeconds(() => {
                const remainingSeconds = convertMinutesToSeconds(newStartTime);

                saveToLocalStorage("remainingTimeInSeconds", remainingSeconds);
                return remainingSeconds;
            });

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

            setStartTimeInMinutes(() => {
                saveToLocalStorage("startTimeInMinutes", newStartTime);
                return newStartTime;
            });

            setRemainingTimeInSeconds(() => {
                const remainingSeconds = convertMinutesToSeconds(newStartTime);

                saveToLocalStorage("remainingTimeInSeconds", remainingSeconds);
                return remainingSeconds;
            });

            setCurrentSessionCount((sessionCount) => {
                const newSessionCount = sessionCount + 1;

                saveToLocalStorage("currentSessionCount", newSessionCount);
                return newSessionCount;
            });
        }
    };

    return { switchSessionType };
};

export default useSessionSwitch;
