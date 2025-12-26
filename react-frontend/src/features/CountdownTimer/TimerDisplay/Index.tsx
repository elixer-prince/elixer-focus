import ClickableArea from "@features/CountdownTimer/TimerDisplay/ClickableArea";
import CountdownMinutesAndSeconds from "@features/CountdownTimer/TimerDisplay/CountdownMinutesAndSeconds";
import CountdownSeconds from "@features/CountdownTimer/TimerDisplay/CountdownSeconds";
import FocusRing from "@features/CountdownTimer/TimerDisplay/FocusRing/Index";
import useHandleCountdownState from "@features/CountdownTimer/TimerDisplay/hooks/useHandleCountdownState";
import SessionCount from "@features/CountdownTimer/TimerDisplay/SessionCount";

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
