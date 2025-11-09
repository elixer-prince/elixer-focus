import { useContext } from "react";
import { CountdownTimerContext } from "@features/countdown-timer/CountdownTimerContext";

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

    const countdownTimerIsPaused = (): boolean => timerPaused;
    const countdownTimerIsNotPaused = (): boolean => !timerPaused;
    const countdownTimerIsRunning = (): boolean => timerRunning;
    const countdownTimerIsNotRunning = (): boolean => !timerRunning;

    /*----------------------------------------------
    |   Complex Checks
    |-----------------------------------------------
    |
    */

    const countdownTimerIsNotPausedOrIsRunning = (): boolean =>
        countdownTimerIsNotPaused() || countdownTimerIsRunning();

    const countdownTimerIsRunningOrIsPaused = (): boolean =>
        countdownTimerIsRunning() || countdownTimerIsPaused();

    const countdownTimerIsRunningAndIsPaused = (): boolean =>
        countdownTimerIsRunning() && countdownTimerIsPaused();

    return {
        countdownTimerIsPaused,
        countdownTimerIsNotPaused,
        countdownTimerIsRunning,
        countdownTimerIsNotRunning,
        countdownTimerIsRunningOrIsPaused,
        countdownTimerIsRunningAndIsPaused,
        countdownTimerIsNotPausedOrIsRunning,
    };
};

export default useCountdownTimerChecks;
