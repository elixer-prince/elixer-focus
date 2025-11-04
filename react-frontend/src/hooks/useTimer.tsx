import { convertMinutesToSeconds } from "../util/functions/conversion";
import { playSound } from "../util/functions/sound";
import { formatTimeInMinutesAndSeconds } from "../util/functions/timer/formatting";
import { useTimerContext } from "./context/useTimerContext";

const useTimer = () => {
    const {
        timerInterval,

        // SOUND EFFECTS
        beepSoundEffect,
        offClickSoundEffect,
        onClickSoundEffect,

        // TIMER TIMING

        // Not Reactive
        pauseRemaining,
        timerEndTime: endTime,

        // Reactive
        startTimeInMinutes,
        remainingTimeInSeconds,
        setRemainingTimeInSeconds,

        // TIMER STATE
        timerRunning,
        setTimerRunning,
        // timerPaused, //
        // setTimerPaused, //
    } = useTimerContext();

    const formattedTimeRemaining = formatTimeInMinutesAndSeconds(
        remainingTimeInSeconds,
    );

    const startTimer = () => {
        const now = Date.now(); // current timestamp

        const timeRemainingInMilliseconds =
            convertMinutesToSeconds(startTimeInMinutes * 60) * 1000;

        const durationInMilliseconds = pauseRemaining.current
            ? pauseRemaining.current * 1000
            : timeRemainingInMilliseconds;

        endTime.current = now + durationInMilliseconds;

        // clear the pause reference so it doesn’t affect next start
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
