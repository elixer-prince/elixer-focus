import CountdownMinutesAndSeconds from "@features/CountdownTimer/TimerDisplay/CountdownMinutesAndSeconds.tsx";
import CountdownSeconds from "@features/CountdownTimer/TimerDisplay/CountdownSeconds.tsx";
import FocusRing from "@features/CountdownTimer/TimerDisplay/FocusRing/Index.tsx";
import useHandleCountdownState from "@features/CountdownTimer/TimerDisplay/hooks/useHandleCountdownState.tsx";
import SessionCount from "@features/CountdownTimer/TimerDisplay/SessionCount.tsx";
import useCountdownTimerContext from "@features/CountdownTimer/hooks/useCountdownTimerContext.tsx";

const CountdownDisplay = () => {
    const { handleCountdownState } = useHandleCountdownState();
    const { remainingTimeInSeconds } = useCountdownTimerContext();

    const isEndingSoon = remainingTimeInSeconds <= 10;

    return (
        <button
            className={`
                hover:bg-base-200 group active:bg-base-100
                relative flex aspect-square w-70 max-w-full flex-col 
                items-center justify-center overflow-hidden rounded-full 
                p-10 transition-all duration-1000 outline-none select-none
                hover:duration-1000 active:duration-100
                ${isEndingSoon ? "animate-pulse" : ""}
            `}
            onClick={handleCountdownState}
        >
            <SessionCount />
            <CountdownSeconds />
            <FocusRing />
            <CountdownMinutesAndSeconds />
        </button>
    );
};

export default CountdownDisplay;
