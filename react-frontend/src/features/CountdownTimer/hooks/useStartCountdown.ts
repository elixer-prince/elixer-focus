import useEndTicking from "@/features/CountdownTimer/hooks/useEndTicking.ts";
import useRunInterval from "@/features/CountdownTimer/hooks/useRunInterval.ts";
import useSessionSwitch from "@/features/CountdownTimer/hooks/useSessionSwitch.ts";
import { useCountdownTimerContext } from "@/features/CountdownTimer/stores/CountdownTimerContext.tsx";
import { calculateEndTime } from "@/features/CountdownTimer/utils/timerCalculations.ts";
import { getCurrentTimestamp } from "@/utils/date.ts";
import { playSound } from "@/utils/sound.ts";
import { saveToLocalStorage } from "@/utils/storage.ts";
import { useCallback, useEffect } from "react";

const useStartCountdown = (): {
    startCountdown: () => void;
    startCountdownWithSound: () => void;
    startCountdownOnPageLoad: () => void;
} => {
    const {
        timerIntervalRef,
        timerOnClickSoundEffectRef,
        timerEndTimeRef,
        isEndTickingRef,
        remainingTimeInSeconds,
        setRemainingTimeInSeconds,
        timerRunning,
        setTimerRunning,
        timerPaused,
        setTimerPaused,
    } = useCountdownTimerContext();
    const { startEndTicking, stopEndTicking } = useEndTicking();
    const { runInterval } = useRunInterval();
    const { switchSessionType } = useSessionSwitch();

    const resetStartingTimerState = useCallback(() => {
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
        resetStartingTimerState();

        const endTime = calculateEndTime(remainingTimeInSeconds);

        // Save the end time to local storage and as a reference
        timerEndTimeRef.current = endTime;
        saveToLocalStorage("timerEndTime", endTime);

        runInterval(endTime);
    }, [
        remainingTimeInSeconds,
        runInterval,
        timerEndTimeRef,
        resetStartingTimerState,
        stopEndTicking,
    ]);

    // Resume based on stored endTime
    const startCountdownOnPageLoad = useCallback(() => {
        // Only resume if it *should* be running
        if (!timerRunning || timerPaused) return;

        // Clear any existing interval before creating a new one
        if (timerIntervalRef.current) {
            clearInterval(timerIntervalRef.current);
            timerIntervalRef.current = null;
        }

        if (!timerEndTimeRef.current) {
            // Fallback if for some reason endTime wasn't stored
            startCountdown();
            return;
        }

        const now = getCurrentTimestamp();
        const endTime = timerEndTimeRef.current;

        const remainingSeconds = Math.max(
            0,
            Math.round((endTime - now) / 1000),
        );

        // If we re-open the page and we're already in the last 10s, start ticking
        if (
            remainingSeconds > 0 &&
            remainingSeconds <= 10 &&
            !isEndTickingRef.current
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

            timerEndTimeRef.current = null;
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
        timerEndTimeRef,
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

        playSound(timerOnClickSoundEffectRef.current);
        startCountdown();
    };

    useEffect(() => {
        startCountdownOnPageLoad();

        return () => {
            // Cleanup on unmount
            if (timerIntervalRef.current) {
                clearInterval(timerIntervalRef.current);
                timerIntervalRef.current = null;
            }
            stopEndTicking(); // In case ticking was happening
        };
    }, [startCountdownOnPageLoad, stopEndTicking, timerIntervalRef]);

    return {
        startCountdown,
        startCountdownWithSound,
        startCountdownOnPageLoad,
    };
};

export default useStartCountdown;
