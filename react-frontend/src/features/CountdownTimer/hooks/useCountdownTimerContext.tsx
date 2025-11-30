import { useContext } from "react";
import { CountdownTimerContext } from "@features/CountdownTimer/stores/CountdownTimerContext.tsx";

const UseCountdownTimerContext = () => {
    const countdownTimerContext = useContext(CountdownTimerContext);

    if (!countdownTimerContext)
        throw new Error("CountdownTimerContext must be defined!");

    return countdownTimerContext;
};

export default UseCountdownTimerContext;
