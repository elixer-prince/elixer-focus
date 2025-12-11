import useCountdownTimerContext from "@features/CountdownTimer/hooks/useCountdownTimerContext.tsx";
import { formatTimeInMinutesAndSeconds } from "@utils/formatting.ts";

const CountdownMinutesAndSeconds = () => {
    const { remainingTimeInSeconds } = useCountdownTimerContext();

    const isEndingSoon = remainingTimeInSeconds <= 10;

    return (
        <div
            className={`text-7xl transition-colors duration-500 ${
                isEndingSoon ? "text-error" : ""
            }`}
        >
            {formatTimeInMinutesAndSeconds(remainingTimeInSeconds)}
        </div>
    );
};

export default CountdownMinutesAndSeconds;
