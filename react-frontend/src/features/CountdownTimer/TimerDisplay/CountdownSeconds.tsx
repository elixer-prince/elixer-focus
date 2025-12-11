import useCountdownTimerContext from "@features/CountdownTimer/hooks/useCountdownTimerContext.tsx";

const CountdownSeconds = () => {
    const { remainingTimeInSeconds } = useCountdownTimerContext();

    const isEndingSoon = remainingTimeInSeconds <= 10;

    return (
        <span className={isEndingSoon ? "text-error" : ""}>
            {remainingTimeInSeconds}{" "}
            <span
                className="text-primary"
            >
                seconds
            </span>
        </span>
    );
};

export default CountdownSeconds;

