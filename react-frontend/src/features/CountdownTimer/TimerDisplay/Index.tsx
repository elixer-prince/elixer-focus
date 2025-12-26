import ClickableArea from "@features/CountdownTimer/TimerDisplay/ClickableArea.tsx";
import CountdownMinutesAndSeconds from "@features/CountdownTimer/TimerDisplay/CountdownMinutesAndSeconds.tsx";
import CountdownSeconds from "@features/CountdownTimer/TimerDisplay/CountdownSeconds.tsx";
import FocusRing from "@features/CountdownTimer/TimerDisplay/FocusRing/Index.tsx";
import useHandleCountdownState from "@features/CountdownTimer/TimerDisplay/hooks/useHandleCountdownState.tsx";
import SessionCount from "@features/CountdownTimer/TimerDisplay/SessionCount.tsx";

const CountdownDisplay = () => {
    const { isEndingSoon } = useHandleCountdownState();

    return (
        // Countdown Timer Clickable Area
        <div
            className={`relative flex aspect-square w-70 max-w-full flex-col items-center justify-center overflow-hidden border border-red-500 p-10 outline-none select-none ${isEndingSoon ? "animate-pulse" : ""}`.trim()}
        >
            <ClickableArea />
            <SessionCount />
            <CountdownSeconds />
            <FocusRing />
            <CountdownMinutesAndSeconds />
        </div>
    );
};

export default CountdownDisplay;
