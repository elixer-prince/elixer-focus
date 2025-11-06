import { useContext } from "react";
import { CountdownTimerContext } from "../../contexts/CountdownTimerContext.tsx";
import { formatTimeInMinutesAndSeconds } from "../../util/functions/timer/formatting.ts";
import useStartCountdown from "./useStartCountdown.tsx";
import useStopCountdown from "./useStopCountdown.tsx";
import useHandleCountdownState from "./useHandleCountdownState.tsx";

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
        pauseRemaining,
        startTimeInMinutes,
        setStartTimeInMinutes,
        timerRunning,
        setTimerRunning,
        timerPaused,
        setTimerPaused,
        remainingTimeInSeconds,
        setRemainingTimeInSeconds,
    } = countdownTimerContext;

    const { startCountdown } = useStartCountdown();
    const { stopCountdown } = useStopCountdown();
    const { handleCountdownState } = useHandleCountdownState();

    const formattedTimeRemaining = formatTimeInMinutesAndSeconds(
        remainingTimeInSeconds,
    );

    return {
        timerBeepSoundEffect,
        timerOffClickSoundEffect,
        timerOnClickSoundEffect,
        timerTickingSoundEffect,
        timerInterval,
        timerEndTime,
        pauseRemaining,
        startCountdown,
        stopCountdown,
        handleCountdownState,
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
