import { SessionProvider } from "../../contexts/SessionContext";
import { TimerProvider } from "../../contexts/TimerContext";
import TimerControls from "./TimerControls";
import TimerDisplay from "./TimerDisplay";

const TimerSection = () => {
    return (
        <TimerProvider>
            <SessionProvider>
                <section className="flex min-h-screen flex-col items-center justify-center gap-8 p-4">
                    {/* <CountdownTimerHeader
                currentSessionType={currentSessionType}
                setCurrentSessionType={setCurrentSessionType}
                currentSessionCount={currentSessionCount}
                sessionCountLimit={sessionCountLimit}
                totalSessionsCompleted={totalSessionsCompleted}
            /> */}

                    <TimerDisplay />

                    <TimerControls />

                    {/* <div className={"mb-8 flex justify-center gap-4"}>
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
                </button> */}
                    {/* <button
                    className={
                        "cursor-pointer rounded-md bg-neutral-500 px-4 py-2 font-bold text-neutral-50"
                    }
                    onClick={() => resetTimer()}
                >
                    Reset
                </button> */}
                    {/* <button
                    className={
                        "cursor-pointer rounded-md bg-neutral-500 px-4 py-2 font-bold text-neutral-50"
                    }
                    onClick={() => skipTimer()}
                >
                    Skip
                </button> */}
                    {/* </div> */}
                </section>
            </SessionProvider>
        </TimerProvider>
    );

    // function updateStartTime() {
    //     const newStartTime = (() => {
    //         switch (currentSessionType) {
    //             case "Focus":
    //                 return focusDuration;
    //             case "Short Break":
    //                 return shortBreakDuration;
    //             case "Long Break":
    //                 return longBreakDuration;
    //             default:
    //                 return focusDuration;
    //         }
    //     })();

    //     const newRemainingSeconds = convertMinutesToSeconds(newStartTime);

    //     setStartTimeInMinutes(newStartTime);
    //     setRemainingTimeInSeconds(newRemainingSeconds);

    //     saveToLocalStorage("remainingTimeInSeconds", newRemainingSeconds);
    // }

    // function handleSessionTypeSwitch() {
    //     let nextSessionType = currentSessionType;
    //     let nextSessionCount = currentSessionCount;
    //     let nextTotalCompleted = totalSessionsCompleted;

    //     if (currentSessionType === "Focus") {
    //         nextTotalCompleted += 1;

    //         if (currentSessionCount + 1 >= sessionCountLimit) {
    //             nextSessionType = "Long Break";
    //             nextSessionCount = 0;
    //         } else {
    //             nextSessionType = "Short Break";
    //             nextSessionCount += 1;
    //         }
    //     } else {
    //         nextSessionType = "Focus";
    //     }

    //     setCurrentSessionType(nextSessionType);
    //     setCurrentSessionCount(nextSessionCount);
    //     setTotalSessionsCompleted(nextTotalCompleted);

    //     // Persist
    //     saveToLocalStorage("currentSessionType", nextSessionType);
    //     saveToLocalStorage("currentSessionCount", nextSessionCount);
    //     saveToLocalStorage("totalSessionsCompleted", nextTotalCompleted);
    // }

    // function calculateEndTime(remainingTimeInSeconds: number) {
    //     // Calculate the end time based on the current time and remaining time
    //     // because browser throttling makes decrementing inaccurate.
    //     return Date.now() + remainingTimeInSeconds * 1000;
    // }

    // function startTimer() {
    //     if (!timerPaused) return;

    //     playSound(onClickSoundEffect);

    //     const newEndTime = calculateEndTime(remainingTimeInSeconds);

    //     setEndTime(newEndTime);
    //     saveToLocalStorage("endTime", newEndTime);

    //     setTimerRunning(true);
    //     setTimerPaused(false);

    //     const interval = setInterval(() => {
    //         setRemainingTimeInSeconds((currentRemainingTime: number) => {
    //             if (currentRemainingTime === 0) {
    //                 clearInterval(interval);
    //                 setTimerRunning(false);
    //                 setTimerPaused(true);
    //                 return 0;
    //             }

    //             const newSeconds = Math.max(
    //                 0,
    //                 Math.round((newEndTime - Date.now()) / 1000),
    //             );

    //             saveToLocalStorage("remainingTimeInSeconds", newSeconds);

    //             if (newSeconds <= 5) playSound(tickingSoundEffect);

    //             if (newSeconds === 0) {
    //                 stopSound(tickingSoundEffect);
    //                 playSound(beepSoundEffect);
    //                 clearInterval(interval);
    //                 setTimerRunning(false);
    //                 setTimerPaused(true);
    //                 handleSessionTypeSwitch();
    //                 setTimeout(() => alert("The timer has ended!"), 1000);
    //             }

    //             return newSeconds;
    //         });
    //     }, 1000);

    //     setTimerInterval(interval);
    // }

    // function pauseTimer() {
    //     if (timerPaused) return;

    //     playSound(offClickSoundEffect);
    //     clearInterval(timerInterval);
    //     setTimerPaused(true);
    // }

    // function resetTimer() {
    //     if (!timerRunning) return;

    //     playSound(resetTimerSoundEffect);
    //     clearInterval(timerInterval);
    //     setTimerRunning(false);
    //     saveToLocalStorage("timerRunning", false);
    //     setTimerPaused(true);
    //     saveToLocalStorage("timerPaused", true);

    //     const newRemainingTime = convertMinutesToSeconds(startTimeInMinutes);

    //     setRemainingTimeInSeconds(newRemainingTime);
    //     saveToLocalStorage("remainingTimeInSeconds", newRemainingTime);
    // }

    // function skipTimer() {
    //     playSound(resetTimerSoundEffect);
    //     clearInterval(timerInterval);
    //     setTimerRunning(false);
    //     setTimerPaused(true);

    //     handleSessionTypeSwitch();
    // }
};

export default TimerSection;
