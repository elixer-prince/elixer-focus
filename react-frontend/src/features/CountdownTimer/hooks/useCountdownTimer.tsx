import { useEffect } from "react";
import { formatTimeInMinutesAndSeconds } from "@utils/formatting.ts";
import useStartCountdown from "@features/CountdownTimer/hooks/useStartCountdown.tsx";
import usePauseCountdown from "@features/CountdownTimer/hooks/usePauseCountdown.tsx";
import useCountdownTimerContext from "@features/CountdownTimer/hooks/useCountdownTimerContext.tsx";
import useHandleCountdownState from "@features/CountdownTimer/CountdownDisplay/hooks/useHandleCountdownState.tsx";

const useCountdownTimer = () => {
    const countdownTimerContext = useCountdownTimerContext();

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
    const { pauseCountdown } = usePauseCountdown();

    const formattedTimeRemaining = formatTimeInMinutesAndSeconds(
        remainingTimeInSeconds,
    );

    useEffect(() => {
        startCountdownOnPageLoad();
    }, [startCountdownOnPageLoad]);

    return {
        timerBeepSoundEffect,
        timerOffClickSoundEffect,
        timerOnClickSoundEffect,
        timerTickingSoundEffect,
        timerInterval,
        timerEndTime,
        timeRemainingOnPause,
        startCountdown,
        handleCountdownState,
        startCountdownWithSound,
        pauseCountdown,
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
