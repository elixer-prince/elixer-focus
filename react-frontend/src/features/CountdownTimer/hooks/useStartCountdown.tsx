import useCountdownTimerContext from "@features/CountdownTimer/hooks/useCountdownTimerContext.tsx";
import useSessionContext from "@features/CountdownTimer/hooks/useSessionContext.tsx";
import useSessionSwitch from "@features/CountdownTimer/hooks/useSessionSwitch.tsx";
import { convertSecondsToMilliseconds } from "@utils/conversion.ts";
import { getCurrentTimestamp } from "@utils/date.ts";
import { playSound, stopSound } from "@utils/sound.ts";
import { saveToLocalStorage } from "@utils/storage.ts";
import { useCallback, useEffect } from "react";

const useStartCountdown = () => {
    const {
        timerBeepSoundEffect,
        timerInterval,
        timerOnClickSoundEffect,
        timerEndTime,
        timerTickingSoundEffect,
        hasPlayedEndBeep,
        remainingTimeInSeconds,
        setRemainingTimeInSeconds,
        timerRunning,
        setTimerRunning,
        timerPaused,
        setTimerPaused,
        isEndTicking
    } = useCountdownTimerContext();

    const { switchSessionType } = useSessionSwitch();
    const { currentSessionType } = useSessionContext();

    const startEndTicking = useCallback(() => {
        const audio = timerTickingSoundEffect.current;
        if (!audio) return;

        if (isEndTicking.current) return; // already ticking, do nothing

        isEndTicking.current = true;
        audio.loop = true;
        playSound(audio); // your util: pause + reset + play
    }, [timerTickingSoundEffect, isEndTicking]);

    const stopEndTicking = useCallback(() => {
        const audio = timerTickingSoundEffect.current;
        if (!audio) return;

        if (!isEndTicking.current) return; // nothing to stop

        isEndTicking.current = false;
        audio.loop = false;
        stopSound(audio); // your util: pause + reset
    }, [timerTickingSoundEffect, isEndTicking]);


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

                // Start ticking exactly when we hit 10 seconds left
                if (remainingSeconds === 10) {
                    startEndTicking();
                }

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

                    // Stop ticking the moment we reach 0
                    stopEndTicking();

                    // Play end beep immediately
                    playSound(timerBeepSoundEffect.current);

                    // Capture the session that just ended
                    const endedSessionType = currentSessionType;

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

                    // Show alert slightly *after* beep starts (non-blocking timing)
                    setTimeout(() => {
                        alert(`Your ${endedSessionType} session has ended!`);
                    }, 1000);
                }
            }, 1000);
        },
        [
            setRemainingTimeInSeconds,
            switchSessionType,
            timerBeepSoundEffect,
            timerEndTime,
            timerInterval,
            hasPlayedEndBeep,
            startEndTicking,
            stopEndTicking,
        ],
    );

    const startCountdown = useCallback(() => {
        hasPlayedEndBeep.current = false;
        stopEndTicking();

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
        stopEndTicking,
        hasPlayedEndBeep,
    ]);

    // Resume based on stored endTime
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

        // If we re-open the page and we're already in the last 10s, start ticking
        if (remainingSeconds > 0 && remainingSeconds <= 10) {
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
