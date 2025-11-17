import useCountdownTimer from "@features/CountdownTimer/hooks/useCountdownTimer.tsx";

const CountdownSeconds = () => {
    const { remainingTimeInSeconds } = useCountdownTimer();

    return (
        <span>
            {remainingTimeInSeconds}{" "}
            <span className="text-primary text-sm font-bold">secs</span>
        </span>
    );
};

export default CountdownSeconds;
