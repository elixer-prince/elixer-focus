import useSessionSwitch from "@features/CountdownTimer/SessionDisplay/hooks/useSessionSwitch.tsx";
import useCountdownTimerContext from "@features/CountdownTimer/hooks/useCountdownTimerContext.tsx";
import {
    convertMinutesToSeconds,
    convertSecondsToMilliseconds,
} from "@utils/conversion.ts";
import { getCurrentTimestamp } from "@utils/date.ts";
import { playSound } from "@utils/sound.ts";
import { saveToLocalStorage } from "@utils/storage.ts";

const useStartCountdown = () => {
    const {
        timerBeepSoundEffect,
        timerInterval,
        timerOnClickSoundEffect,
        timerEndTime,
        // timeRemainingOnPause,
        startTimeInMinutes,
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
            console.log("test");
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

                setRemainingTimeInSeconds(() => {
                    saveToLocalStorage(
                        "remainingTimeInSeconds",
                        convertMinutesToSeconds(startTimeInMinutes),
                    );
                    return convertMinutesToSeconds(startTimeInMinutes);
                });

                if (timerInterval.current !== null)
                    clearInterval(timerInterval.current);

                setTimerPaused(() => {
                    saveToLocalStorage("timerPaused", true);
                    return true;
                });

                setTimerRunning(() => {
                    saveToLocalStorage("timerRunning", false);
                    return false;
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

    return {
        startCountdown,
        startCountdownWithSound,
        startCountdownOnPageLoad,
    };
};

export default useStartCountdown;
