import useCountdownTimerChecks from "./useCountdownTimerChecks.tsx";
import { useContext } from "react";
import { CountdownTimerContext } from "../../contexts/CountdownTimerContext.tsx";
import { playSound } from "../../util/functions/sound.ts";

const UsePauseCountdown = () => {
    const countdownTimerContext = useContext(CountdownTimerContext);

    if (!countdownTimerContext)
        throw new Error("This must be used inside a countdown timer context!");

    const {
        timerInterval,
        setTimerPaused,
        remainingTimeInSeconds,
        timeRemainingOnPause,
        timerOffClickSoundEffect,
    } = countdownTimerContext;

    const { countdownTimerIsPaused } = useCountdownTimerChecks();

    const pauseCountdown = () => {
        if (countdownTimerIsPaused()) return;

        playSound(timerOffClickSoundEffect.current);
        setTimerPaused(true);

        timeRemainingOnPause.current = remainingTimeInSeconds;

        if (timerInterval.current) clearInterval(timerInterval.current);
    };

    return { pauseCountdown };
};

export default UsePauseCountdown;
