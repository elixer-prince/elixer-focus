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
import { useCallback } from "react";

const useRunInterval = () => {
    const { timerBeepSoundEffect, timerInterval, setRemainingTimeInSeconds } =
        useCountdownTimerContext();
    const { currentSessionType } = useSessionContext();
    const { switchSessionType } = useSessionSwitch();
    const { startEndTicking, stopEndTicking } = useEndTicking();

    const alertUserOfTimerEnd = () => {
        setTimeout(() => {
            alert(`Your ${currentSessionType} session has ended!`);
        }, 1000);
    };

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

                if (timerIsAboutToEnd(remainingSeconds)) startEndTicking();

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

    const runInterval = useCallback(
        (endTime: number) => {
            clearIntervalIfItExists();
            timerInterval.current = createNewInterval(endTime);
        },
        [timerInterval, createNewInterval],
    );

    return { runInterval };
};

export default useRunInterval;
