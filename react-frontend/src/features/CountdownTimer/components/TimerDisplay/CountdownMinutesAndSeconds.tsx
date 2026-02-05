import { useCountdownTimerContext } from "@features/CountdownTimer/stores/CountdownTimerContext.tsx";
import useHandleCountdownState from "@features/CountdownTimer/components/TimerDisplay/hooks/useHandleCountdownState.ts";
import { formatTimeInMinutesAndSeconds } from "@utils/formatting.ts";
import { countdownMinutesAndSecondsStyles } from "@features/CountdownTimer/components/TimerDisplay/styles.ts";

const CountdownMinutesAndSeconds = () => {
    const { remainingTimeInSeconds } = useCountdownTimerContext();
    const { isEndingSoon } = useHandleCountdownState();

    return (
        <div
            className={`${countdownMinutesAndSecondsStyles} ${
                isEndingSoon ? "text-error" : ""
            }`}
        >
            {formatTimeInMinutesAndSeconds(remainingTimeInSeconds)}
        </div>
    );
};

export default CountdownMinutesAndSeconds;
