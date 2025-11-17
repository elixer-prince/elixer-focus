import { playSound } from "@utils/sound.ts";
import { convertMinutesToSeconds } from "@utils/conversion.ts";
import useCountdownTimerContext from "@features/CountdownTimer/hooks/useCountdownTimerContext.tsx";

const UseResetCountdown = () => {
    const {
        resetTimerSoundEffect,
        setRemainingTimeInSeconds,
        startTimeInMinutes,
        timerInterval,
        timeRemainingOnPause,
        timerEndTime,
        timerRunning,
        setTimerRunning,
        setTimerPaused,
    } = useCountdownTimerContext();

    const resetCountdown = () => {
        if (!timerRunning) return;

        if (timerInterval.current) clearInterval(timerInterval.current);

        if (timeRemainingOnPause.current) timeRemainingOnPause.current = null;
        timerEndTime.current = null;

        setTimerRunning(false);
        setTimerPaused(true);

        setRemainingTimeInSeconds(convertMinutesToSeconds(startTimeInMinutes));
    };

    const resetCountdownWithSound = () => {
        resetCountdown();
        if (timerRunning) playSound(resetTimerSoundEffect.current);
    };

    return { resetCountdown, resetCountdownWithSound };
};

export default UseResetCountdown;
