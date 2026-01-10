import useSessionSwitch from "@features/CountdownTimer/hooks/CountdownSession/useSessionSwitch";
import useEndTicking from "@features/CountdownTimer/hooks/CountdownTimer/useEndTicking";
import { useCountdownTimerContext } from "@features/CountdownTimer/stores/CountdownTimerContext";
import { useSessionContext } from "@features/CountdownTimer/stores/SessionContext";
import { calculateRemainingSeconds } from "@features/CountdownTimer/utils/timerCalculations";
import {
    timerHasEnded,
    timerIsAboutToEnd,
} from "@features/CountdownTimer/utils/timerChecks";
import { getCurrentTimestamp } from "@utils/date";
import { playSound } from "@utils/sound";
import { saveToLocalStorage } from "@utils/storage";
import { useCallback, useRef } from "react";

const useRunInterval = () => {
    const { timerBeepSoundEffect, timerInterval, setRemainingTimeInSeconds } =
        useCountdownTimerContext();
    const { currentSessionType } = useSessionContext();
    const { switchSessionType } = useSessionSwitch();
    const { startEndTicking, stopEndTicking } = useEndTicking();

    // Track when we enter the "ending soon" state
    const previousSeconds = useRef<number | null>(null);

    /*-----------------------------------------------------
    | Helper Functions
    |------------------------------------------------------
    |
    */

    // Timer Alerts

    const alertUserOfTimerEnd = useCallback(() => {
        setTimeout(() => {
            alert(`Your ${currentSessionType} session has ended!`);
        }, 1000);
    }, [currentSessionType]);

    // Timer Interval

    const clearIntervalIfItExists = useCallback(() => {
        console.log("Testing for timer interval...");
        console.log(timerInterval.current);

        if (timerInterval.current) {
            console.log("The interval was cleared!");
            clearInterval(timerInterval.current);
            timerInterval.current = null;
        }
    }, [timerInterval]);

    const createNewInterval = useCallback(
        (endTime: number) => {
            return setInterval(() => {
                const now = getCurrentTimestamp();
                const remainingSeconds = calculateRemainingSeconds(
                    now,
                    endTime,
                );

                // Start ticking at 10 seconds (only when entering the state)
                const wasNotAboutToEnd =
                    previousSeconds.current === null ||
                    previousSeconds.current > 10;
                const isNowAboutToEnd = timerIsAboutToEnd(remainingSeconds);

                if (wasNotAboutToEnd && isNowAboutToEnd) {
                    console.log("TRIGGERING startEndTicking");
                    startEndTicking();
                }

                // Update previous seconds for next iteration
                previousSeconds.current = remainingSeconds;

                setRemainingTimeInSeconds(() => {
                    saveToLocalStorage(
                        "remainingTimeInSeconds",
                        remainingSeconds,
                    );
                    return remainingSeconds;
                });

                if (timerHasEnded(remainingSeconds)) {
                    clearIntervalIfItExists();
                    stopEndTicking();
                    playSound(timerBeepSoundEffect.current);
                    alertUserOfTimerEnd();
                    switchSessionType();
                }
            }, 1000);
        },
        [
            timerBeepSoundEffect,
            switchSessionType,
            setRemainingTimeInSeconds,
            startEndTicking,
            stopEndTicking,
            alertUserOfTimerEnd,
            clearIntervalIfItExists,
        ],
    );

    /*-----------------------------------------------------
    | ⌛ Main Run Interval Function ⌛
    |------------------------------------------------------
    |
    | This function is used to run the interval that
    | updates the remaining time in seconds every second.
    |
    */

    const runInterval = useCallback(
        (endTime: number) => {
            console.log("Run interval was called once!");
            // clearIntervalIfItExists();
            timerInterval.current = createNewInterval(endTime);
        },
        [timerInterval, createNewInterval],
    );

    return { runInterval };
};

export default useRunInterval;
