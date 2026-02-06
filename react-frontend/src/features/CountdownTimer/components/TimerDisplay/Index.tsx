import ClickableArea from "@/features/CountdownTimer/components/TimerDisplay/ClickableArea.tsx";
import CountdownMinutesAndSeconds from "@/features/CountdownTimer/components/TimerDisplay/CountdownMinutesAndSeconds.tsx";
import CountdownSeconds from "@/features/CountdownTimer/components/TimerDisplay/CountdownSeconds.tsx";
import FocusRing from "@/features/CountdownTimer/components/TimerDisplay/FocusRing/Index.tsx";
import useHandleCountdownState from "@/features/CountdownTimer/components/TimerDisplay/hooks/useHandleCountdownState.ts";
import SessionCount from "@/features/CountdownTimer/components/TimerDisplay/SessionCount.tsx";

const CountdownDisplay = () => {
    const { isEndingSoon } = useHandleCountdownState();

    return (
        <div
            className={`${"relative flex aspect-square w-70 max-w-full flex-col items-center justify-center overflow-hidden p-10 outline-none select-none"} ${isEndingSoon ? "animate-pulse" : ""}`.trim()}
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
