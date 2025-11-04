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
        timerEndTime: endTime,
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

        const timeRemainingInMilliseconds =
            convertMinutesToSeconds(startTimeInMinutes * 60) * 1000;

        const durationInMilliseconds = pauseRemaining.current
            ? pauseRemaining.current * 1000
            : timeRemainingInMilliseconds;

        endTime.current = now + durationInMilliseconds;

        // Clear the pause reference so it doesn’t affect next start
        pauseRemaining.current = null;

        timerInterval.current = setInterval(() => {
            const now = Date.now();
            const remainingMilliseconds = (endTime.current ?? now) - now;

            if (remainingMilliseconds <= 0) {
                playSound(beepSoundEffect.current);
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

    return {
        startTimeInMinutes,
        formattedTimeRemaining,
        handleTimerState,
        remainingTimeInSeconds,
    };
};

export default useTimer;
