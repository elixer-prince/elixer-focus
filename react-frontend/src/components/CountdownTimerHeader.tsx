import { saveToLocalStorage } from "../functions/utilityFunctions.ts";
import type { SessionType } from "../functions/timerFunctions.ts";

const CountdownTimerHeader = ({
    currentSessionType,
    setCurrentSessionType,
    currentSessionCount,
    sessionCountLimit,
    totalSessionsCompleted,
}: {
    currentSessionType: SessionType;
    setCurrentSessionType: (newSessionType: SessionType) => void;
    currentSessionCount: number;
    sessionCountLimit: number;
    totalSessionsCompleted: number;
}) => {
    return (
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
                        onClick={() => changeSessionType("Focus")}
                    >
                        Focus
                    </button>
                    <button
                        className={
                            "cursor-pointer rounded-md border-2 border-neutral-950 px-2 py-1 text-sm font-bold text-neutral-950 transition-colors"
                        }
                        onClick={() => changeSessionType("Short Break")}
                    >
                        Short Break
                    </button>
                    <button
                        className={
                            "cursor-pointer rounded-md border-2 border-neutral-950 px-2 py-1 text-sm font-bold text-neutral-950 transition-colors"
                        }
                        onClick={() => changeSessionType("Long Break")}
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
    );

    function changeSessionType(newSessionType: SessionType) {
        setCurrentSessionType(newSessionType);
        saveToLocalStorage("currentSessionType", newSessionType);
    }
};

export default CountdownTimerHeader;
