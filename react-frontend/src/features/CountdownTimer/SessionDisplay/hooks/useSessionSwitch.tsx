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
        setCurrentSessionType("Focus");

        const newStartTime = focusDuration;

        setStartTimeInMinutes(() => {
            saveToLocalStorage("startTimeInMinutes", newStartTime);
            return newStartTime;
        });
        setRemainingTimeInSeconds(() => {
            // Directly update remainingTimeInSeconds
            const remainingSeconds = convertMinutesToSeconds(newStartTime);
            saveToLocalStorage("remainingTimeInSeconds", remainingSeconds);
            return remainingSeconds;
        });
    };

    const handleBreakSwitching = () => {
        if (currentSessionCount + 1 >= sessionCountLimit) {
            setCurrentSessionType("Long Break");

            const newStartTime = longBreakDuration;

            setStartTimeInMinutes(() => {
                saveToLocalStorage("startTimeInMinutes", newStartTime);
                return newStartTime;
            });
            setRemainingTimeInSeconds(() => {
                // Directly update remainingTimeInSeconds
                const remainingSeconds = convertMinutesToSeconds(newStartTime);
                saveToLocalStorage("remainingTimeInSeconds", remainingSeconds);
                return remainingSeconds;
            });
            setCurrentSessionCount(0);
        } else {
            setCurrentSessionType("Short Break");

            const newStartTime = shortBreakDuration;

            setStartTimeInMinutes(() => {
                saveToLocalStorage("startTimeInMinutes", newStartTime);
                return newStartTime;
            });
            setRemainingTimeInSeconds(() => {
                // Directly update remainingTimeInSeconds
                const remainingSeconds = convertMinutesToSeconds(newStartTime);
                saveToLocalStorage("remainingTimeInSeconds", remainingSeconds);
                return remainingSeconds;
            });

            setCurrentSessionCount((count) => count + 1);
        }
    };

    return { switchSessionType };
};

export default useSessionSwitch;
