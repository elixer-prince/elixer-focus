import { useContext } from "react";
import { playSound } from "@utils/sound.ts";
import { CountdownTimerContext } from "@features/CountdownTimer/stores/TimerContext.tsx";
import useCountdownTimerChecks from "@features/CountdownTimer/hooks/useCountdownTimerChecks.tsx";
import { getCurrentTimestamp } from "@utils/date.ts";
import {
    convertMinutesToMilliseconds,
    convertMinutesToSeconds,
} from "@utils/conversion.ts";

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
        remainingTimeInSeconds,
        setRemainingTimeInSeconds,
        setTimerRunning,
        setTimerPaused,
    } = countdownTimerContext;

    const {
        countdownTimerIsRunning,
        countdownTimerIsNotPaused,
        countdownTimerIsNotRunning,
    } = useCountdownTimerChecks();

    const startCountdown = () => {
        if (countdownTimerIsNotPaused()) return;

        setTimerPaused(false);
        if (countdownTimerIsNotRunning()) setTimerRunning(true);

        let now = getCurrentTimestamp();

        if (timeRemainingOnPause.current) {
            timerEndTime.current = now + timeRemainingOnPause.current * 1000;
            timeRemainingOnPause.current = null;
        } else {
            timerEndTime.current =
                now + convertMinutesToMilliseconds(startTimeInMinutes);
        }

        if (timerInterval.current) clearInterval(timerInterval.current);

        if (countdownTimerIsRunning())
            return (timeRemainingOnPause.current = remainingTimeInSeconds);

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

    const startCountdownOnPageLoad = () => {
        if (countdownTimerIsNotRunning()) return;
        startCountdown();
    };

    const startCountdownWithSound = () => {
        startCountdown();
        playSound(timerOnClickSoundEffect.current);
    };

    return {
        startCountdown,
        startCountdownWithSound,
        startCountdownOnPageLoad,
    };
};

export default useStartCountdown;
