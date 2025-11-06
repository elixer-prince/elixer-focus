import { playSound } from "../util/functions/sound";
import { getCurrentTimestamp } from "../util/functions/date.ts";
import { convertMinutesToMilliseconds, convertMinutesToSeconds } from "../util/functions/conversion.ts";
import { useContext } from "react";
import { CountdownTimerContext } from "../contexts/CountdownTimerContext.tsx";

const useStartCountdown = () => {
    const countdownTimerContext = useContext(CountdownTimerContext);

    if (!countdownTimerContext) {
        throw new Error();
    }

    const {
        timerInterval,
        timerBeepSoundEffect,
        pauseRemaining,
        timerEndTime: endTime,
        startTimeInMinutes,
        setRemainingTimeInSeconds,
        setTimerRunning,
        // timerPaused, //
        // setTimerPaused, //
    } = countdownTimerContext;

    const startCountdown = () => {
        const now = getCurrentTimestamp();

        const timeRemainingInMilliseconds =
            convertMinutesToMilliseconds(startTimeInMinutes);

        const durationInMilliseconds = pauseRemaining.current
            ? pauseRemaining.current * 1000
            : timeRemainingInMilliseconds;

        endTime.current = now + durationInMilliseconds;

        // clear the pause reference so it doesn’t affect next start
        pauseRemaining.current = null;

        timerInterval.current = setInterval(() => {
            const now = getCurrentTimestamp();
            const remainingMilliseconds = (endTime.current ?? now) - now;

            if (remainingMilliseconds <= 0) {
                playSound(timerBeepSoundEffect.current);
                setRemainingTimeInSeconds(
                    convertMinutesToSeconds(startTimeInMinutes),
                );
                clearInterval(timerInterval.current!);
                setTimerRunning(false);
                return;
            }

            setRemainingTimeInSeconds(Math.ceil(remainingMilliseconds / 1000));
        }, 1000);

        setTimerRunning(true);
    };

    return [startCountdown];
};

export default useStartCountdown;
