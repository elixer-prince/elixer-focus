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
            <header
                className={
                    "mx-auto flex w-fit flex-col items-center justify-center gap-2"
                }
            >
                <div className={"flex flex-col items-center gap-4"}>
                    <h2 className={"text-2xl font-black"}>
                        {currentSessionType} Session
                    </h2>

                    <div className={"flex gap-4"}>
                        <button
                            className={
                                "cursor-pointer rounded-md border-2 border-neutral-950 px-2 py-1 text-sm font-bold text-neutral-950 transition-colors"
                            }
                        >
                            Focus
                        </button>
                        <button
                            className={
                                "cursor-pointer rounded-md border-2 border-neutral-950 px-2 py-1 text-sm font-bold text-neutral-950 transition-colors"
                            }
                        >
                            Short Break
                        </button>
                        <button
                            className={
                                "cursor-pointer rounded-md border-2 border-neutral-950 px-2 py-1 text-sm font-bold text-neutral-950 transition-colors"
                            }
                        >
                            Long Break
                        </button>
                    </div>
                </div>
                <div className={"font-bold"}>
                    Current Session: {currentSessionCount} / {sessionCountLimit}{" "}
                    &mdash; Total Focus Sessions: {totalSessionsCompleted}
                </div>
            </header>

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
};

export default CountdownTimer;
