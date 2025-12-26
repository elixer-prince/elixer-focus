import useSessionSwitch from "@features/CountdownTimer/hooks/CountdownSession/useSessionSwitch";
import useCountdownTimerContext from "@features/CountdownTimer/hooks/CountdownTimer/useCountdownTimerContext";
import useEndTicking from "@features/CountdownTimer/hooks/CountdownTimer/useEndTicking";
import useRunInterval from "@features/CountdownTimer/hooks/CountdownTimer/useRunInterval";
import { calculateEndTime } from "@features/CountdownTimer/utils/timerCalculations";
import { getCurrentTimestamp } from "@utils/date";
import { playSound } from "@utils/sound";
import { saveToLocalStorage } from "@utils/storage";
import { useCallback, useEffect } from "react";

const useStartCountdown = () => {
    const {
        timerInterval,
        timerOnClickSoundEffect,
        timerEndTime,
        isEndTicking,
        remainingTimeInSeconds,
        setRemainingTimeInSeconds,
        timerRunning,
        setTimerRunning,
        timerPaused,
        setTimerPaused,
    } = useCountdownTimerContext();
    const { startEndTicking, stopEndTicking } = useEndTicking();
    const { switchSessionType } = useSessionSwitch();
    const { runInterval } = useRunInterval();

    /*------------------------------------------------------------
     |  Helper Functions
     |------------------------------------------------------------
     |
     */

    const startTimerState = useCallback(() => {
        setTimerPaused(() => {
            saveToLocalStorage("timerPaused", false);
            return false;
        });

        setTimerRunning(() => {
            saveToLocalStorage("timerRunning", true);
            return true;
        });
    }, [setTimerPaused, setTimerRunning]);

    /*------------------------------------------------------------
     |  Main Timer Start Functions
     |------------------------------------------------------------
     |
     */

    const startCountdown = useCallback(() => {
        stopEndTicking();
        startTimerState();

        const endTime = calculateEndTime(remainingTimeInSeconds);

        timerEndTime.current = endTime;
        saveToLocalStorage("timerEndTime", endTime);

        runInterval(endTime);
    }, [
        remainingTimeInSeconds,
        runInterval,
        timerEndTime,
        startTimerState,
        stopEndTicking,
    ]);

    // Resume based on stored endTime
    const startCountdownOnPageLoad = useCallback(() => {
        // Only resume if it *should* be running
        if (!timerRunning || timerPaused) return;

        // Clear any existing interval before creating a new one
        if (timerInterval.current) {
            clearInterval(timerInterval.current);
            timerInterval.current = null;
        }

        if (!timerEndTime.current) {
            // Fallback if for some reason endTime wasn't stored
            startCountdown();
            return;
        }

        const now = getCurrentTimestamp();
        const endTime = timerEndTime.current;

        const remainingSeconds = Math.max(
            0,
            Math.round((endTime - now) / 1000),
        );

        // If we re-open the page and we're already in the last 10s, start ticking
        if (
            remainingSeconds > 0 &&
            remainingSeconds <= 10 &&
            !isEndTicking.current
        ) {
            startEndTicking();
        }

        if (remainingSeconds <= 0) {
            // Timer actually finished while we were away
            stopEndTicking(); // if it was ticking in the background

            setRemainingTimeInSeconds(() => {
                saveToLocalStorage("remainingTimeInSeconds", 0);
                return 0;
            });

            // Handle completion just like in the interval finish case
            switchSessionType();

            setTimerPaused(() => {
                const newTimerPaused = true;
                saveToLocalStorage("timerPaused", newTimerPaused);
                return newTimerPaused;
            });

            setTimerRunning(() => {
                const newTimerRunning = false;
                saveToLocalStorage("timerRunning", newTimerRunning);
                return newTimerRunning;
            });

            timerEndTime.current = null;
            saveToLocalStorage("timerEndTime", null);

            return;
        }

        // Update remaining time to reflect time elapsed while away
        setRemainingTimeInSeconds(() => {
            saveToLocalStorage("remainingTimeInSeconds", remainingSeconds);
            return remainingSeconds;
        });

        // Resume ticking from the original endTime
        runInterval(endTime);
    }, [
        timerRunning,
        timerPaused,
        timerEndTime,
        startEndTicking,
        stopEndTicking,
        setRemainingTimeInSeconds,
        setTimerPaused,
        setTimerRunning,
        switchSessionType,
        startCountdown,
        runInterval,
    ]);

    const startCountdownWithSound = () => {
        if (!timerPaused) return;
        playSound(timerOnClickSoundEffect.current);
        startCountdown();
    };

    useEffect(() => {
        startCountdownOnPageLoad();

        return () => {
            // Cleanup on unmount
            if (timerInterval.current) {
                clearInterval(timerInterval.current);
                timerInterval.current = null;
            }
            stopEndTicking(); // In case ticking was happening
        };
    }, [startCountdownOnPageLoad, stopEndTicking, timerInterval]);

    return {
        startCountdown,
        startCountdownWithSound,
        startCountdownOnPageLoad,
    };
};

export default useStartCountdown;
