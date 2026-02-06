import useHandleCountdownState from "@/features/CountdownTimer/components/TimerDisplay/hooks/useHandleCountdownState.ts";
import { useCountdownTimerContext } from "@/features/CountdownTimer/stores/CountdownTimerContext.tsx";
import { formatTimeInMinutesAndSeconds } from "@/utils/formatting.ts";

const CountdownMinutesAndSeconds = () => {
    const { remainingTimeInSeconds } = useCountdownTimerContext();
    const { isEndingSoon } = useHandleCountdownState();

    return (
        <div
            className={`pointer-events-none z-10 text-7xl transition-colors duration-500 ${
                isEndingSoon ? "text-error" : ""
            }`}
        >
            {formatTimeInMinutesAndSeconds(remainingTimeInSeconds)}
        </div>
    );
};

export default CountdownMinutesAndSeconds;
