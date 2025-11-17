import { playSound } from "@utils/sound.ts";
import { getCurrentTimestamp } from "@utils/date.ts";
import {
    convertMinutesToMilliseconds,
    convertMinutesToSeconds,
} from "@utils/conversion.ts";
import useCountdownTimerContext from "@features/CountdownTimer/hooks/useCountdownTimerContext.tsx";

const useStartCountdown = () => {
    const {
        timerBeepSoundEffect,
        timerInterval,
        timerOnClickSoundEffect,
        timerEndTime,
        timeRemainingOnPause,
        startTimeInMinutes,
        remainingTimeInSeconds,
        setRemainingTimeInSeconds,
        timerRunning,
        setTimerRunning,
        timerPaused,
        setTimerPaused,
    } = useCountdownTimerContext();

    const startCountdown = () => {
        if (!timerPaused) return;

        setTimerPaused(false);
        if (!timerRunning) setTimerRunning(true);

        let now = getCurrentTimestamp();

        if (timeRemainingOnPause.current) {
            timerEndTime.current = now + timeRemainingOnPause.current * 1000;
            timeRemainingOnPause.current = null;
        } else {
            timerEndTime.current =
                now + convertMinutesToMilliseconds(startTimeInMinutes);
        }

        if (timerInterval.current) clearInterval(timerInterval.current);

        if (timerRunning)
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
        if (!timerRunning) return;
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
