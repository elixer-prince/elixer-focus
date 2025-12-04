import UseCountdownTimerContext from "@features/CountdownTimer/hooks/useCountdownTimerContext.tsx";
import useSessionContext from "@features/CountdownTimer/SessionDisplay/hooks/useSessionContext";
import { saveToLocalStorage } from "@utils/storage.ts";

const useSessionSwitch = () => {
    const {
        focusDuration,
        shortBreakDuration,
        longBreakDuration,
        currentSessionType,
        setCurrentSessionType,
        currentSessionCount,
        setCurrentSessionCount,
        sessionCountLimit,
    } = useSessionContext();

    const { setStartTimeInMinutes } = UseCountdownTimerContext();

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
        setStartTimeInMinutes(() => {
            saveToLocalStorage("startTimeInMinutes", focusDuration);
            return focusDuration;
        });
    };

    const handleBreakSwitching = () => {
        if (currentSessionCount + 1 >= sessionCountLimit) {
            setCurrentSessionType("Long Break");
            setStartTimeInMinutes(() => {
                saveToLocalStorage("startTimeInMinutes", longBreakDuration);
                return longBreakDuration;
            });
            setCurrentSessionCount(0);
        } else {
            setCurrentSessionType("Short Break");
            setStartTimeInMinutes(() => {
                saveToLocalStorage("startTimeInMinutes", shortBreakDuration);
                return shortBreakDuration;
            });

            setCurrentSessionCount((count) => count + 1);
        }
    };

    return { switchSessionType };
};

export default useSessionSwitch;
