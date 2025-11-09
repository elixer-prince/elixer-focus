import { useContext } from "react";
import { CountdownTimerContext } from "@features/countdown-timer/CountdownTimerContext";
import { formatTimeInMinutesAndSeconds } from "@utils/functions/timer/formatting";
import useStartCountdown from "@hooks/CountdownTimer/useStartCountdown";
import useHandleCountdownState from "@hooks/CountdownTimer/useHandleCountdownState";
import useResetCountdown from "@hooks/CountdownTimer/useResetCountdown";
import usePauseCountdown from "@hooks/CountdownTimer/usePauseCountdown";

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

    const { startCountdown, startCountdownWithSound } = useStartCountdown();
    const { handleCountdownState } = useHandleCountdownState();
    const { resetCountdown, resetCountdownWithSound } = useResetCountdown();
    const { pauseCountdown } = usePauseCountdown();

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
