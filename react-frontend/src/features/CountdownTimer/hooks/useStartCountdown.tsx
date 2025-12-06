import useCountdownTimerContext from "@features/CountdownTimer/hooks/useCountdownTimerContext.tsx";
import useSessionSwitch from "@features/CountdownTimer/SessionDisplay/hooks/useSessionSwitch.tsx";
import { convertSecondsToMilliseconds } from "@utils/conversion.ts";
import { getCurrentTimestamp } from "@utils/date.ts";
import { playSound } from "@utils/sound.ts";
import { saveToLocalStorage } from "@utils/storage.ts";
import { useEffect } from "react";

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

    const startCountdown = () => {
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

        if (timerInterval.current) clearInterval(timerInterval.current);

        timerInterval.current = setInterval(() => {
            const remainingSeconds = Math.max(
                0,
                Math.round((endTime - getCurrentTimestamp()) / 1000),
            );

            setRemainingTimeInSeconds(() => {
                saveToLocalStorage("remainingTimeInSeconds", remainingSeconds);
                return remainingSeconds;
            });

            if (remainingSeconds <= 0) {
                playSound(timerBeepSoundEffect.current);

                switchSessionType();

                if (timerInterval.current !== null)
                    clearInterval(timerInterval.current);

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
            }
        }, 1000);
    };

    const startCountdownOnPageLoad = () => {
        if (timerRunning && !timerPaused) startCountdown();
    };

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
