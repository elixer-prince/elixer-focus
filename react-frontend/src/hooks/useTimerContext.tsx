import { useContext } from "react";
import { TimerContext } from "../contexts/TimerContext";

export const useTimerContext = () => {
    const context = useContext(TimerContext);

    if (!context) {
        throw new Error("useTimerContext must be used within a TimerProvider");
    }

    return context;
};
