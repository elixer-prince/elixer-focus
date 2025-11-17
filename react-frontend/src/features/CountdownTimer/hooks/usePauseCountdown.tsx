import { useContext } from "react";
import useCountdownTimerChecks from "@features/CountdownTimer/hooks/useCountdownTimerChecks.tsx";
import { playSound } from "@utils/sound.ts";
import { CountdownTimerContext } from "@features/CountdownTimer/stores/TimerContext.tsx";

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
