import { useContext } from "react";
import { TimerSettingsContext } from "@features/CountdownTimer/TimerSettings/stores/TimerSettingsContext.tsx";

const useTimerSettingsContext = () => {
    const timerSettingsContext = useContext(TimerSettingsContext);

    if (!timerSettingsContext) {
        throw new Error(
            "useTimerSettingContext must be used within a TimerSettingsProvider!",
        );
    }

    return timerSettingsContext;
};

export default useTimerSettingsContext;
