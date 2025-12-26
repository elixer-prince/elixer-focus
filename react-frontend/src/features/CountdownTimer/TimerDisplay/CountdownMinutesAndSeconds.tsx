import useCountdownTimerContext from "@features/CountdownTimer/hooks/CountdownTimer/useCountdownTimerContext";
import { formatTimeInMinutesAndSeconds } from "@utils/formatting";
import useHandleCountdownState from "@features/CountdownTimer/TimerDisplay/hooks/useHandleCountdownState";

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
