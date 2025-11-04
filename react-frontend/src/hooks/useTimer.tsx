import { convertMinutesToSeconds } from "../util/functions/conversion";
import { playSound } from "../util/functions/sound";
import { formatTimeInMinutesAndSeconds } from "../util/functions/timer/formatting";
import { useTimerContext } from "./context/useTimerContext";

const useTimer = () => {
    const {
        timerInterval,
        // Sound Effects
        beepSoundEffect,
        offClickSoundEffect,
        onClickSoundEffect,
        // Time Remaining
        startTimeInMinutes,
        remainingTimeInSeconds,
        pauseRemaining,
        endTime,
        // Timer State
        timerRunning,
        // timerPaused, //
        // State Change
        setTimerRunning,
        // setTimerPaused, //
        setRemainingTimeInSeconds,
    } = useTimerContext();

    const formattedTimeRemaining = formatTimeInMinutesAndSeconds(
        remainingTimeInSeconds,
    );

    const startTimer = () => {
        const now = Date.now();

        const durationInMs =
            pauseRemaining.current !== null
                ? pauseRemaining.current * 1000
                : startTimeInMinutes * 60 * 1000;

        endTime.current = now + durationInMs;

        // clear the pause reference so it doesn’t affect next start
        pauseRemaining.current = null;

        timerInterval.current = setInterval(() => {
            const now = Date.now();
            const remainingMs = (endTime.current ?? now) - now;

            if (remainingMs <= 0) {
                playSound(beepSoundEffect.current);
                setRemainingTimeInSeconds(
                    convertMinutesToSeconds(startTimeInMinutes),
                );
                clearInterval(timerInterval.current!);
                setTimerRunning(false);
                return;
            }

            setRemainingTimeInSeconds(Math.ceil(remainingMs / 1000));
        }, 1000);

        setTimerRunning(true);
    };

    const stopTimer = () => {
        if (timerInterval.current) clearInterval(timerInterval.current);

        pauseRemaining.current = remainingTimeInSeconds;
        endTime.current = null;
        setTimerRunning(false);
    };

    const handleTimerState = () => {
        if (timerRunning) {
            playSound(offClickSoundEffect.current);
            stopTimer();
        } else {
            playSound(onClickSoundEffect.current);
            startTimer();
        }
    };

    return { formattedTimeRemaining, handleTimerState };
};

export default useTimer;
