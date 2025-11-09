import { useContext } from "react";
import { playSound } from "@utils/functions/sound.ts";
import { CountdownTimerContext } from "@features/countdown-timer/CountdownTimerContext.tsx";
import useCountdownTimerChecks from "@features/countdown-timer/hooks/useCountdownTimerChecks.tsx";
import { getCurrentTimestamp } from "@utils/functions/date.ts";
import {
    convertMinutesToMilliseconds,
    convertMinutesToSeconds,
} from "@utils/functions/conversion.ts";

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
        timerEndTime,
        timeRemainingOnPause,
        startTimeInMinutes,
        setRemainingTimeInSeconds,
        setTimerRunning,
        setTimerPaused,
    } = countdownTimerContext;

    const { countdownTimerIsNotPaused } = useCountdownTimerChecks();

    const startCountdown = () => {
        if (countdownTimerIsNotPaused()) return;

        setTimerPaused(false);
        setTimerRunning(true);

        let now = getCurrentTimestamp();

        // Resume case: use paused time, otherwise use start time
        if (timeRemainingOnPause.current) {
            timerEndTime.current = now + timeRemainingOnPause.current * 1000;
            timeRemainingOnPause.current = null;
        } else {
            timerEndTime.current =
                now + convertMinutesToMilliseconds(startTimeInMinutes);
        }

        if (timerInterval.current) clearInterval(timerInterval.current);

        timerInterval.current = setInterval(() => {
            if (!timerEndTime.current) return;

            now = getCurrentTimestamp();
            const remainingTimeMs = timerEndTime.current - now;
            const remainingSeconds = Math.floor(remainingTimeMs / 1000);
            setRemainingTimeInSeconds(remainingSeconds);

            if (remainingSeconds <= 0) {
                setRemainingTimeInSeconds(
                    convertMinutesToSeconds(startTimeInMinutes),
                );
                playSound(timerBeepSoundEffect.current);
                if (timerInterval.current) clearInterval(timerInterval.current);
                setTimerRunning(false);
                setTimerPaused(true);
                timerEndTime.current = null;
            }
        }, 1000);
    };

    const startCountdownWithSound = () => {
        if (countdownTimerIsNotPaused()) return;

        playSound(timerOnClickSoundEffect.current);
        startCountdown();
    };

    return { startCountdown, startCountdownWithSound };
};

export default useStartCountdown;
