import { useContext } from "react";
import { CountdownTimerContext } from "@features/CountdownTimer/stores/TimerContext.tsx";

const UseCountdownTimerContext = () => {
    const countdownTimerContext = useContext(CountdownTimerContext);

    if (!countdownTimerContext)
        throw new Error("CountdownTimerContext must be defined!");

    return countdownTimerContext;
};

export default UseCountdownTimerContext;
