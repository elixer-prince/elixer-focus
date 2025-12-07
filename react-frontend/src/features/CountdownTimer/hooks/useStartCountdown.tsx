import useCountdownTimerContext from "@features/CountdownTimer/hooks/useCountdownTimerContext.tsx";
import useSessionSwitch from "@features/CountdownTimer/hooks/useSessionSwitch.tsx";
import { convertSecondsToMilliseconds } from "@utils/conversion.ts";
import { getCurrentTimestamp } from "@utils/date.ts";
import { playSound } from "@utils/sound.ts";
import { saveToLocalStorage } from "@utils/storage.ts";
import { useCallback, useEffect } from "react";

const useStartCountdown = () => {
    const {
        timerBeepSoundEffect,
        timerInterval,
        timerOnClickSoundEffect,
        timerEndTime,
        remainingTimeInSeconds,
        setRemainingTimeInSeconds,
        timerRunning,
        setTimerRunning,
        timerPaused,
        setTimerPaused,
    } = useCountdownTimerContext();

    const { switchSessionType } = useSessionSwitch();

    const runInterval = useCallback(
        (endTime: number) => {
            // Clear existing interval just in case
            if (timerInterval.current) clearInterval(timerInterval.current);

            timerInterval.current = setInterval(() => {
                const now = getCurrentTimestamp();

                const remainingSeconds = Math.max(
                    0,
                    Math.round((endTime - now) / 1000),
                );

                setRemainingTimeInSeconds(() => {
                    saveToLocalStorage(
                        "remainingTimeInSeconds",
                        remainingSeconds,
                    );
                    return remainingSeconds;
                });

                if (remainingSeconds <= 0) {
                    // Timer finished
                    if (timerInterval.current !== null) {
                        clearInterval(timerInterval.current);
                        timerInterval.current = null;
                    }

                    // Optional: you *can* try to play a sound here,
                    // but browsers often block autoplay without user gesture
                    playSound(timerBeepSoundEffect.current);

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

                    // Clear stored end time
                    timerEndTime.current = null;
                    saveToLocalStorage("timerEndTime", null);
                }
            }, 1000);
        },
        [
            setRemainingTimeInSeconds,
            switchSessionType,
            timerBeepSoundEffect,
            timerEndTime,
            timerInterval,
        ],
    );

    const startCountdown = useCallback(() => {
        setTimerPaused(() => {
            saveToLocalStorage("timerPaused", false);
            return false;
        });

        setTimerRunning(() => {
            saveToLocalStorage("timerRunning", true);
            return true;
        });

        const endTime =
            getCurrentTimestamp() +
            convertSecondsToMilliseconds(remainingTimeInSeconds);

        timerEndTime.current = endTime;
        saveToLocalStorage("timerEndTime", endTime);

        runInterval(endTime);
    }, [
        remainingTimeInSeconds,
        runInterval,
        setTimerPaused,
        setTimerRunning,
        timerEndTime,
    ]);

    // 🧠 New logic: resume based on stored endTime
    const startCountdownOnPageLoad = useCallback(() => {
        // Only resume if it *should* be running
        if (!timerRunning || timerPaused) return;
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

        if (remainingSeconds <= 0) {
            // Timer actually finished while we were away
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
    }, [startCountdownOnPageLoad]);

    return {
        startCountdown,
        startCountdownWithSound,
        startCountdownOnPageLoad,
    };
};

export default useStartCountdown;
