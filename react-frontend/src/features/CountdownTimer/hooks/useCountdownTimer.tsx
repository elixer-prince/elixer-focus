import { useContext, useEffect } from "react";
import { CountdownTimerContext } from "@features/CountdownTimer/stores/TimerContext.tsx";
import { formatTimeInMinutesAndSeconds } from "@utils/formatting.ts";
import useStartCountdown from "@features/CountdownTimer/hooks/useStartCountdown.tsx";
import useHandleCountdownState from "@features/CountdownTimer/hooks/useHandleCountdownState.tsx";
import useResetCountdown from "@features/CountdownTimer/hooks/useResetCountdown.tsx";
import usePauseCountdown from "@features/CountdownTimer/hooks/usePauseCountdown.tsx";
import { saveToLocalStorage } from "@utils/storage.ts";

const useCountdownTimer = () => {
    const countdownTimerContext = useContext(CountdownTimerContext);

    if (!countdownTimerContext)
        throw new Error("CountdownTimerContext must be defined!");

    const {
        timerBeepSoundEffect,
        timerOffClickSoundEffect,
        timerOnClickSoundEffect,
        timerTickingSoundEffect,
        timerInterval,
        timerEndTime,
        timeRemainingOnPause,
        startTimeInMinutes,
        setStartTimeInMinutes,
        timerRunning,
        setTimerRunning,
        timerPaused,
        setTimerPaused,
        remainingTimeInSeconds,
        setRemainingTimeInSeconds,
    } = countdownTimerContext;

    const {
        startCountdown,
        startCountdownWithSound,
        startCountdownOnPageLoad,
    } = useStartCountdown();
    const { handleCountdownState } = useHandleCountdownState();
    const { resetCountdown, resetCountdownWithSound } = useResetCountdown();
    const { pauseCountdown } = usePauseCountdown();

    const formattedTimeRemaining = formatTimeInMinutesAndSeconds(
        remainingTimeInSeconds,
    );

    useEffect(() => {
        startCountdownOnPageLoad();
    }, [startCountdownOnPageLoad]);

    useEffect(() => {
        saveToLocalStorage("remainingTimeInSeconds", remainingTimeInSeconds);
    }, [remainingTimeInSeconds]);

    useEffect(() => {
        saveToLocalStorage("timerEndTime", timerEndTime);
    }, [timerEndTime]);

    useEffect(() => {
        saveToLocalStorage("timerRunning", timerRunning);
    }, [timerRunning]);

    useEffect(() => {
        saveToLocalStorage("timerPaused", timerPaused);
    }, [timerPaused]);

    useEffect(() => {
        saveToLocalStorage("timerRemainingOnPause", timeRemainingOnPause);
    }, [timeRemainingOnPause]);

    return {
        timerBeepSoundEffect,
        timerOffClickSoundEffect,
        timerOnClickSoundEffect,
        timerTickingSoundEffect,
        timerInterval,
        timerEndTime,
        timeRemainingOnPause,
        startCountdown,
        startCountdownWithSound,
        pauseCountdown,
        handleCountdownState,
        resetCountdown,
        resetCountdownWithSound,
        formattedTimeRemaining,
        startTimeInMinutes,
        setStartTimeInMinutes,
        timerRunning,
        setTimerRunning,
        timerPaused,
        setTimerPaused,
        remainingTimeInSeconds,
        setRemainingTimeInSeconds,
    };
};

export default useCountdownTimer;
