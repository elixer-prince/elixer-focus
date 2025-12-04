import useCountdownTimerContext from "@features/CountdownTimer/hooks/useCountdownTimerContext.tsx";

const CountdownSeconds = () => {
    const { remainingTimeInSeconds } = useCountdownTimerContext();

    return (
        <span>
            {remainingTimeInSeconds}{" "}
            <span className="text-primary text-sm font-bold">secs</span>
        </span>
    );
};

export default CountdownSeconds;
