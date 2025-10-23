import { useState } from "react";

const CountdownTimer = () => {
    const [remainingTimeInSeconds, setRemainingTimeSeconds] = useState(1500);
    const [currentSessionCount, setCurrentSessionCount] = useState(0);
    const [currentSessionType, setCurrentSessionType] = useState("Focus");
    const [totalSessionsCompleted, setTotalSessionsCompleted] = useState(0);
    const sessionCountLimit = 4;

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
