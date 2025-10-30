import { useEffect, useMemo, useState } from "react";
// HELPER FUNCTIONS
import {
    convertMinutesToSeconds,
    formatTimeInMinutesAndSeconds,
} from "../functions/timerFunctions.ts";
import {
    getFromLocalStorage,
    playSound,
    saveToLocalStorage,
} from "../functions/utilityFunctions.ts";
// COMPONENTS
import CountdownTimerHeader from "./CountdownTimerHeader.tsx";
// SOUND EFFECT URLS
import onClickSoundURL from "./../assets/audio/sound-effects/on-click.mp3";
import offClickSoundURL from "./../assets/audio/sound-effects/off-click.mp3";
import beepSoundURL from "./../assets/audio/sound-effects/beep.mp3";
import tickingSoundURL from "./../assets/audio/sound-effects/ticking.mp3";
import resetTimerSoundURL from "./../assets/audio/sound-effects/reset-timer.mp3";

type Audio = HTMLAudioElement | null;

const CountdownTimer = () => {
    // SOUND EFFECTS
    const onClickSoundEffect: Audio = useMemo(
        () => new Audio(onClickSoundURL),
        [],
    );
    const offClickSoundEffect: Audio = useMemo(
        () => new Audio(offClickSoundURL),
        [],
    );
    const beepSoundEffect: Audio = useMemo(() => new Audio(beepSoundURL), []);
    const tickingSoundEffect: Audio = useMemo(
        () => new Audio(tickingSoundURL),
        [],
    );
    const resetTimerSoundEffect: Audio = useMemo(
        () => new Audio(resetTimerSoundURL),
        [],
    );

    // MEMOS
    const sessionCountLimit: number = useMemo(
        () => getFromLocalStorage("sessionCountLimit") || 4,
        [],
    );
    const focusDuration: number = useMemo(
        () => getFromLocalStorage("focusDuration") || 25,
        [],
    );
    const shortBreakDuration: number = useMemo(
        () => getFromLocalStorage("shortBreakDuration") || 5,
        [],
    );
    const longBreakDuration: number = useMemo(
        () => getFromLocalStorage("longBreakDuration") || 15,
        [],
    );

    const formatTimeInMinutesAndSeconds = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const secondsRemainder = seconds % 60;
        return `${minutes.toString().padStart(2, "0")}:${secondsRemainder.toString().padStart(2, "0")}`;
    };

    const playSound = (effect: any) => {
        effect.currentTime = 0;
        effect.play();
    };

    const stopSound = (effect: any) => {
        effect.pause();
        effect.currentTime = 0;
    };

    useEffect(() => {});

    return (
        <section>
            <CountdownTimerHeader
                currentSessionType={currentSessionType}
                setCurrentSessionType={setCurrentSessionType}
                currentSessionCount={currentSessionCount}
                sessionCountLimit={sessionCountLimit}
                totalSessionsCompleted={totalSessionsCompleted}
            />

            <article
                className={
                    "mx-auto my-8 flex aspect-square w-fit max-w-full items-center justify-center rounded-full border-2 p-20 text-8xl font-bold"
                }
            >
                {remainingTimeInSeconds}
            </article>

            <div>
                <button
                    className={
                        "cursor-pointer rounded-md bg-neutral-500 px-4 py-2 font-bold text-neutral-50"
                    }
                >
                    Start
                </button>
                <button
                    className={
                        "cursor-pointer rounded-md bg-neutral-500 px-4 py-2 font-bold text-neutral-50"
                    }
                >
                    Pause
                </button>
                <button
                    className={
                        "cursor-pointer rounded-md bg-neutral-500 px-4 py-2 font-bold text-neutral-50"
                    }
                >
                    Reset
                </button>
                <button
                    className={
                        "cursor-pointer rounded-md bg-neutral-500 px-4 py-2 font-bold text-neutral-50"
                    }
                >
                    Skip
                </button>
            </div>
        </section>
    );

    function updateStartTime() {
        const newStartTime = (() => {
            switch (currentSessionType) {
                case "Focus":
                    return focusDuration;
                case "Short Break":
                    return shortBreakDuration;
                case "Long Break":
                    return longBreakDuration;
                default:
                    return focusDuration;
            }
        })();

        const newRemainingSeconds = convertMinutesToSeconds(newStartTime);

        setStartTimeInMinutes(newStartTime);
        setRemainingTimeInSeconds(newRemainingSeconds);

        saveToLocalStorage("remainingTimeInSeconds", newRemainingSeconds);
    }

    function handleSessionTypeSwitch() {
        let nextSessionType = currentSessionType;
        let nextSessionCount = currentSessionCount;
        let nextTotalCompleted = totalSessionsCompleted;

        if (currentSessionType === "Focus") {
            nextTotalCompleted += 1;

            if (currentSessionCount + 1 >= sessionCountLimit) {
                nextSessionType = "Long Break";
                nextSessionCount = 0;
            } else {
                nextSessionType = "Short Break";
                nextSessionCount += 1;
            }
        } else {
            nextSessionType = "Focus";
        }

        setCurrentSessionType(nextSessionType);
        setCurrentSessionCount(nextSessionCount);
        setTotalSessionsCompleted(nextTotalCompleted);

        // Persist
        saveToLocalStorage("currentSessionType", nextSessionType);
        saveToLocalStorage("currentSessionCount", nextSessionCount);
        saveToLocalStorage("totalSessionsCompleted", nextTotalCompleted);
    }

    function calculateEndTime(remainingTimeInSeconds: number) {
        // Calculate the end time based on the current time and remaining time
        // because browser throttling makes decrementing inaccurate.
        return Date.now() + remainingTimeInSeconds * 1000;
    }

    }

    function pauseTimer() {
        if (timerPaused) return;

        playSound(offClickSoundEffect);
        clearInterval(timerInterval);
        setTimerPaused(true);
    }

    function resetTimer() {
        if (!timerRunning) return;

        playSound(resetTimerSoundEffect);
        clearInterval(timerInterval);
        setTimerRunning(false);
        saveToLocalStorage("timerRunning", false);
        setTimerPaused(true);
        saveToLocalStorage("timerPaused", true);

        const newRemainingTime = convertMinutesToSeconds(startTimeInMinutes);

        setRemainingTimeInSeconds(newRemainingTime);
        saveToLocalStorage("remainingTimeInSeconds", newRemainingTime);
    }

    function skipTimer() {
        playSound(resetTimerSoundEffect);
        clearInterval(timerInterval);
        setTimerRunning(false);
        setTimerPaused(true);

        handleSessionTypeSwitch();
    }
};

export default CountdownTimer;
