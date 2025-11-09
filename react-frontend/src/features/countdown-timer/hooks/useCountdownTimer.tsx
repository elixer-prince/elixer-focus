import { useContext } from "react";
import { CountdownTimerContext } from "@features/countdown-timer/stores/TimerContext.tsx";
import { formatTimeInMinutesAndSeconds } from "@utils/functions/timer/formatting.ts";
import useStartCountdown from "@features/countdown-timer/hooks/useStartCountdown.tsx";
import useHandleCountdownState from "@features/countdown-timer/hooks/useHandleCountdownState.tsx";
import useResetCountdown from "@features/countdown-timer/hooks/useResetCountdown.tsx";
import usePauseCountdown from "@features/countdown-timer/hooks/usePauseCountdown.tsx";

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
