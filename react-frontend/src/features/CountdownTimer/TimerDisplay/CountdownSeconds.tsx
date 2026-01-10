import { useCountdownTimerContext } from "@features/CountdownTimer/stores/CountdownTimerContext";
import useHandleCountdownState from "@features/CountdownTimer/TimerDisplay/hooks/useHandleCountdownState";

const CountdownSeconds = () => {
    const { remainingTimeInSeconds } = useCountdownTimerContext();
    const { isEndingSoon } = useHandleCountdownState();

    return (
        <span
            className={`pointer-events-none z-10 ${isEndingSoon ? "text-error" : ""}`.trim()}
        >
            {remainingTimeInSeconds}{" "}
            <span className="text-primary">seconds</span>
        </span>
    );
};

export default CountdownSeconds;
