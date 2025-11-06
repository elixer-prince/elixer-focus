import { useContext } from "react";
import { CountdownTimerContext } from "../../contexts/CountdownTimerContext.tsx";
import useCountdownTimerChecks from "./useCountdownTimerChecks.tsx";
import { playSound } from "../../util/functions/sound.ts";

const UseStopCountdown = () => {
    const countdownTimerContext = useContext(CountdownTimerContext);

    if (!countdownTimerContext) {
        throw new Error();
    }

    const {
        timerOffClickSoundEffect,
        timerInterval,
        pauseRemaining,
        timerEndTime,
        remainingTimeInSeconds,
        setTimerRunning,
        setTimerPaused,
    } = countdownTimerContext;

    const { countdownTimerIsNotRunning } = useCountdownTimerChecks();

    const stopCountdown = () => {
        if (countdownTimerIsNotRunning()) return;

        playSound(timerOffClickSoundEffect.current);

        if (timerInterval.current) clearInterval(timerInterval.current);

        pauseRemaining.current = remainingTimeInSeconds;
        timerEndTime.current = null;
        setTimerRunning(false);
        setTimerPaused(true);
    };

    return { stopCountdown };
};

export default UseStopCountdown;
