import { useContext } from "react";
import { CountdownTimerContext } from "../contexts/CountdownTimerContext.tsx";

const useCountdownTimerChecks = () => {
    const countdownTimerContext = useContext(CountdownTimerContext);

    if (!countdownTimerContext) {
        throw new Error();
    }

    const { timerPaused, timerRunning } = countdownTimerContext;

    /*----------------------------------------------
    |   Basic Checks
    |-----------------------------------------------
    |
    */

    const countdownTimerIsPaused = () => timerPaused;
    const countdownTimerIsNotPaused = () => !timerPaused;
    const countdownTimerIsRunning = () => timerRunning;
    const countdownTimerIsNotRunning = () => !timerRunning;

    /*----------------------------------------------
    |   Complex Checks
    |-----------------------------------------------
    |
    */

    return [
        countdownTimerIsPaused,
        countdownTimerIsNotPaused,
        countdownTimerIsRunning,
        countdownTimerIsNotRunning,
    ];
};

export default useCountdownTimerChecks;
