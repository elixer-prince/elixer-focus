import useCountdownTimer from "@features/CountdownTimer/hooks/useCountdownTimer.tsx";

const CountdownMinutes = () => {
    const { formattedTimeRemaining } = useCountdownTimer();

    return <div className="text-7xl">{formattedTimeRemaining}</div>;
};

export default CountdownMinutes;
