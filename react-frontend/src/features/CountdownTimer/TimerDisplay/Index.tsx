import ClickableArea from "@features/CountdownTimer/TimerDisplay/ClickableArea";
import CountdownMinutesAndSeconds from "@features/CountdownTimer/TimerDisplay/CountdownMinutesAndSeconds";
import CountdownSeconds from "@features/CountdownTimer/TimerDisplay/CountdownSeconds";
import FocusRing from "@features/CountdownTimer/TimerDisplay/FocusRing/Index";
import useHandleCountdownState from "@features/CountdownTimer/TimerDisplay/hooks/useHandleCountdownState";
import SessionCount from "@features/CountdownTimer/TimerDisplay/SessionCount";

const CountdownDisplay = () => {
    const { isEndingSoon } = useHandleCountdownState();

    return (
        <div
            className={`relative flex aspect-square w-70 max-w-full flex-col items-center justify-center overflow-hidden p-10 outline-none select-none ${isEndingSoon ? "animate-pulse" : ""}`.trim()}
        >
            <ClickableArea />
            <FocusRing />
            <SessionCount />
            <CountdownSeconds />
            <CountdownMinutesAndSeconds />
        </div>
    );
};

export default CountdownDisplay;
