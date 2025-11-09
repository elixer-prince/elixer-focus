import { useContext } from "react";
import { CountdownTimerContext } from "@features/countdown-timer/stores/TimerContext.tsx";
import useCountdownTimerChecks from "@features/countdown-timer/hooks/useCountdownTimerChecks.tsx";
import { playSound } from "@utils/functions/sound.ts";
import { convertMinutesToSeconds } from "@utils/functions/conversion.ts";

const UseResetCountdown = () => {
    const countdownTimerContext = useContext(CountdownTimerContext);

    if (!countdownTimerContext) throw new Error();

    const {
        resetTimerSoundEffect,
        setRemainingTimeInSeconds,
        startTimeInMinutes,
        timerInterval,
        timeRemainingOnPause,
        remainingTimeInSeconds,
        timerEndTime,
        setTimerRunning,
        setTimerPaused,
    } = countdownTimerContext;
    const { countdownTimerIsNotRunning, countdownTimerIsRunning } =
        useCountdownTimerChecks();

    const resetCountdown = () => {
        if (countdownTimerIsNotRunning()) return;

        if (timerInterval.current) clearInterval(timerInterval.current);
        if (timeRemainingOnPause.current) timeRemainingOnPause.current = null;

        timeRemainingOnPause.current = remainingTimeInSeconds;
        timerEndTime.current = null;
        setTimerRunning(false);
        setTimerPaused(true);

        setRemainingTimeInSeconds(convertMinutesToSeconds(startTimeInMinutes));
    };

    const resetCountdownWithSound = () => {
        resetCountdown();
        if (countdownTimerIsRunning()) playSound(resetTimerSoundEffect.current);
    };

    return { resetCountdown, resetCountdownWithSound };
};

export default UseResetCountdown;
