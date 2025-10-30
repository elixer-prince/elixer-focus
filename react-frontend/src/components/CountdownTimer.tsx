import { useState } from "react";

const CountdownTimer = () => {
    const sessionCountLimit = 4;
    // @ts-ignore
    const [focusDuration, setFocusDuration] = useState(0);
    // @ts-ignore
    const [shortBreakDuration, setShortBreakDuration] = useState(0);
    // @ts-ignore
    const [longBreakDuration, setLongBreakDuration] = useState(0);
    // @ts-ignore
    const [currentSessionCount, setCurrentSessionCount] = useState(0);
    // @ts-ignore
    const [currentSessionType, setCurrentSessionType] = useState("Focus");
    // @ts-ignore
    const [totalSessionsCompleted, setTotalSessionsCompleted] = useState(0);
    // @ts-ignore
    const [interval, setInterval] = useState(null);
    // @ts-ignore
    const [intervalStarted, setIntervalStarted] = useState(false);
    // @ts-ignore
    const [timerPaused, setTimerPaused] = useState(true);
    // @ts-ignore
    const [totalStartTimeInSeconds, setTotalStartTimeInSeconds] = useState(0);
    // @ts-ignore
    const [endTime, setEndTime] = useState(0);
    // @ts-ignore
    const [startTimeInMinutes, setStartTimeInMinutes] = useState(0);
    // @ts-ignore
    const [startTimeInSeconds, setStartTimeInSeconds] = useState(
        convertMinutesToSeconds(startTimeInMinutes),
    );
    // @ts-ignore
    const [remainingTimeInSeconds, setRemainingTimeSeconds] = useState(0);

    // SOUND EFFECTS
    // @ts-ignore
    const [onClickSoundEffect, setOnClickSoundEffect] = useState(null);
    // @ts-ignore
    const [offClickSoundEffect, setOffClickSoundEffect] = useState(null);
    // @ts-ignore
    const [beepSoundEffect, setBeepSoundEffect] = useState(null);
    // @ts-ignore
    const [tickingSoundEffect, setTickingSoundEffect] = useState(null);
    // @ts-ignore
    const [resetTimerSoundEffect, setResetTimerSoundEffect] = useState(null);

    const convertMinutesToSeconds = (minutes: number) => {
        return minutes * 60;
    };

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

    /*
    |----------------------------------------------------------------
    |  INITIALISATION
    |----------------------------------------------------------------
    |
    */

    function initialiseVariables() {
        setSessionCountLimit(getFromLocalStorage("sessionCountLimit") || 4);
        setFocusDuration(getFromLocalStorage("focusDuration") || 25);
        setShortBreakDuration(getFromLocalStorage("shortBreakDuration") || 5);
        setLongBreakDuration(getFromLocalStorage("longBreakDuration") || 15);
        setCurrentSessionCount(getFromLocalStorage("currentSessionCount") || 0);
        setCurrentSessionType(
            getFromLocalStorage("currentSessionType") || "Focus",
        );
        setTotalSessionsCompleted(
            getFromLocalStorage("totalSessionsCompleted") || 0,
        );
        setTimerRunning(getFromLocalStorage("timerRunning") || false);
        setTimerPaused(getFromLocalStorage("timerPaused") || true);
        setStartTimeInSeconds(convertMinutesToSeconds(startTimeInMinutes));
        setTotalStartTimeInSeconds(startTimeInSeconds);
    }

    function initialiseSoundEffects() {
        setOnClickSoundEffect(new Audio(onClickSoundURL));
        setOffClickSoundEffect(new Audio(offClickSoundURL));
        setBeepSoundEffect(new Audio(beepSoundURL));
        setTickingSoundEffect(new Audio(tickingSoundURL));
        setResetTimerSoundEffect(new Audio(resetTimerSoundURL));
    }
};

export default CountdownTimer;
