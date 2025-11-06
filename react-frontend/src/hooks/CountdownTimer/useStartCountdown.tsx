import { playSound } from "../../util/functions/sound.ts";
import { getCurrentTimestamp } from "../../util/functions/date.ts";
import {
    convertMinutesToMilliseconds,
    convertMinutesToSeconds,
} from "../../util/functions/conversion.ts";
import { useContext } from "react";
import { CountdownTimerContext } from "../../contexts/CountdownTimerContext.tsx";
import useCountdownTimerChecks from "./useCountdownTimerChecks.tsx";

const useStartCountdown = () => {
    const countdownTimerContext = useContext(CountdownTimerContext);

    if (!countdownTimerContext) {
        throw new Error(
            "This hook has to be used inside a CountdownTimerContext!",
        );
    }

    const {
        timerBeepSoundEffect,
        timerInterval,
        timerOnClickSoundEffect,
        pauseRemaining,
        timerEndTime,
        startTimeInMinutes,
        setRemainingTimeInSeconds,
        setTimerRunning,
        setTimerPaused,
    } = countdownTimerContext;

    const { countdownTimerIsNotPaused } = useCountdownTimerChecks();

    const startCountdown = () => {
        if (countdownTimerIsNotPaused()) return;

        playSound(timerOnClickSoundEffect.current);
        setTimerPaused(false);
        setTimerRunning(true);

        const now = getCurrentTimestamp();

        const timeRemainingInMilliseconds =
            convertMinutesToMilliseconds(startTimeInMinutes);

        const durationInMilliseconds = pauseRemaining.current
            ? pauseRemaining.current * 1000
            : timeRemainingInMilliseconds;

        timerEndTime.current = now + durationInMilliseconds;
        pauseRemaining.current = null;

        timerInterval.current = setInterval(() => {
            const now = getCurrentTimestamp();
            const remainingMilliseconds = (timerEndTime.current ?? now) - now;

            if (remainingMilliseconds <= 0) {
                playSound(timerBeepSoundEffect.current);
                setRemainingTimeInSeconds(
                    convertMinutesToSeconds(startTimeInMinutes),
                );
                clearInterval(timerInterval.current!);
                return setTimerRunning(false);
            }

            setRemainingTimeInSeconds(Math.ceil(remainingMilliseconds / 1000));
        }, 1000);

        setTimerRunning(true);
    };

    return { startCountdown };
};

export default useStartCountdown;
