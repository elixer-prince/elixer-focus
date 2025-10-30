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

    // MUTABLE STATES
    const [timerInterval, setTimerInterval] = useState<any>(null);
    const [currentSessionType, setCurrentSessionType] = useState(
        getFromLocalStorage("currentSessionType") || "Focus",
    );
    const [currentSessionCount, setCurrentSessionCount] = useState<number>(
        getFromLocalStorage("currentSessionCount") || 0,
    );
    const [totalSessionsCompleted, setTotalSessionsCompleted] =
        useState<number>(getFromLocalStorage("totalSessionsCompleted") || 0);
    const [startTimeInMinutes, setStartTimeInMinutes] = useState<number>(
        getFromLocalStorage("startTimeInMinutes") || 0,
    );
    const [remainingTimeInSeconds, setRemainingTimeInSeconds] =
        useState<number>(
            getFromLocalStorage("remainingTimeInSeconds") ||
                convertMinutesToSeconds(startTimeInMinutes),
        );
    // @ts-ignore
    const [endTime, setEndTime] = useState<number>(
        getFromLocalStorage("endTime") || 0,
    );
    const [timerRunning, setTimerRunning] = useState<boolean>(
        getFromLocalStorage("timerRunning") || false,
    );
    const [timerPaused, setTimerPaused] = useState<boolean>(
        getFromLocalStorage("timerPaused") || true,
    );

    useEffect(() => {
        updateStartTime();
    }, [currentSessionType]);

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
                {formatTimeInMinutesAndSeconds(remainingTimeInSeconds)}
            </article>

            <div>
                <button
                    className={
                        "cursor-pointer rounded-md bg-neutral-500 px-4 py-2 font-bold text-neutral-50"
                    }
                    onClick={() => startTimer()}
                >
                    Start
                </button>
                <button
                    className={
                        "cursor-pointer rounded-md bg-neutral-500 px-4 py-2 font-bold text-neutral-50"
                    }
                    onClick={() => pauseTimer()}
                >
                    Pause
                </button>
                <button
                    className={
                        "cursor-pointer rounded-md bg-neutral-500 px-4 py-2 font-bold text-neutral-50"
                    }
                    onClick={() => resetTimer()}
                >
                    Reset
                </button>
                <button
                    className={
                        "cursor-pointer rounded-md bg-neutral-500 px-4 py-2 font-bold text-neutral-50"
                    }
                    onClick={() => skipTimer()}
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

    function startTimer() {
        if (!timerPaused) return;

        playSound(onClickSoundEffect);

        const newEndTime = calculateEndTime(remainingTimeInSeconds);

        setEndTime(newEndTime);
        saveToLocalStorage("endTime", newEndTime);

        setTimerRunning(true);
        setTimerPaused(false);

        const interval = setInterval(() => {
            setRemainingTimeInSeconds((currentRemainingTime: number) => {
                if (currentRemainingTime === 0) {
                    clearInterval(interval);
                    setTimerRunning(false);
                    setTimerPaused(true);
                    return 0;
                }

                const newSeconds = Math.max(
                    0,
                    Math.round((newEndTime - Date.now()) / 1000),
                );

                saveToLocalStorage("remainingTimeInSeconds", newSeconds);

                if (newSeconds <= 5) playSound(tickingSoundEffect);

                if (newSeconds === 0) {
                    stopSound(tickingSoundEffect);
                    playSound(beepSoundEffect);
                    clearInterval(interval);
                    setTimerRunning(false);
                    setTimerPaused(true);
                    handleSessionTypeSwitch();
                    setTimeout(() => alert("The timer has ended!"), 1000);
                }

                return newSeconds;
            });
        }, 1000);

        setTimerInterval(interval);
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
