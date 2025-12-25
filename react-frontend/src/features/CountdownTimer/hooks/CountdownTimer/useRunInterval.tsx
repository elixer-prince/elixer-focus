import useSessionContext from "@features/CountdownTimer/hooks/CountdownSession/useSessionContext.tsx";
import useSessionSwitch from "@features/CountdownTimer/hooks/CountdownSession/useSessionSwitch.tsx";
import useCountdownTimerContext from "@features/CountdownTimer/hooks/CountdownTimer/useCountdownTimerContext.tsx";
import useEndTicking from "@features/CountdownTimer/hooks/CountdownTimer/useEndTicking.tsx";
import { calculateRemainingSeconds } from "@features/CountdownTimer/utils/timerCalculations.tsx";
import {
    timerHasEnded,
    timerIsAboutToEnd,
} from "@features/CountdownTimer/utils/timerChecks.ts";
import { getCurrentTimestamp } from "@utils/date.ts";
import { playSound } from "@utils/sound.ts";
import { saveToLocalStorage } from "@utils/storage.ts";
import { useCallback } from "react";

const useRunInterval = () => {
    const { timerBeepSoundEffect, timerInterval, setRemainingTimeInSeconds } =
        useCountdownTimerContext();
    const { currentSessionType } = useSessionContext();
    const { switchSessionType } = useSessionSwitch();
    const { startEndTicking, stopEndTicking } = useEndTicking();

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
        if (timerInterval.current) {
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

                // Start ticking at 10 seconds
                if (timerIsAboutToEnd(remainingSeconds)) {
                    console.log({ remainingSeconds });
                    startEndTicking();
                }

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
            clearIntervalIfItExists();

            timerInterval.current = createNewInterval(endTime);
        },
        [timerInterval, clearIntervalIfItExists, createNewInterval],
    );

    return { runInterval };
};

export default useRunInterval;
