// import { saveToLocalStorage } from "../utils/utilityFunctions.ts";
// import type { SessionType } from "../../utils/types.ts";

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

import useSessionContext from "@features/CountdownTimer/hooks/useSessionContext.tsx";

const CountdownTimerHeader = () => {
    const { currentSessionType } = useSessionContext();

    return (
        <header className="mt-8">
            <p className="text-4xl font-bold">{currentSessionType} Session</p>
        </header>
        // <SessionDisplay
        //     className={
        //         "mx-auto flex w-fit flex-col items-center justify-center gap-2"
        //     }
        // >
        //     <div className={"flex flex-col items-center gap-4"}>
        //         <h2 className={"text-2xl font-black"}>
        //             {currentSessionType} Session
        //         </h2>
        //
        //         <div className={"flex gap-4"}>
        //             <button
        //                 className={
        //                     "cursor-pointer rounded-md border-2 border-neutral-950 px-2 py-1 text-sm font-bold text-neutral-950 transition-colors"
        //                 }
        //                 onClick={() => changeSessionType("Focus")}
        //             >
        //                 Focus
        //             </button>
        //             <button
        //                 className={
        //                     "cursor-pointer rounded-md border-2 border-neutral-950 px-2 py-1 text-sm font-bold text-neutral-950 transition-colors"
        //                 }
        //                 onClick={() => changeSessionType("Short Break")}
        //             >
        //                 Short Break
        //             </button>
        //             <button
        //                 className={
        //                     "cursor-pointer rounded-md border-2 border-neutral-950 px-2 py-1 text-sm font-bold text-neutral-950 transition-colors"
        //                 }
        //                 onClick={() => changeSessionType("Long Break")}
        //             >
        //                 Long Break
        //             </button>
        //         </div>
        //     </div>
        //     <div className={"font-bold"}>
        //         &mdash; Total Focus Sessions: {totalSessionsCompleted}
        //     </div>
        // </SessionDisplay>
    );

    // function changeSessionType(newSessionType: SessionType) {
    //     setCurrentSessionType(newSessionType);
    //     saveToLocalStorage("currentSessionType", newSessionType);
    // }
};

export default CountdownTimerHeader;
