import useCountdownTimer from "@features/CountdownTimer/hooks/useCountdownTimer.tsx";

const CountdownMinutesAndSeconds = () => {
    const { formattedTimeRemaining } = useCountdownTimer();

    return <div className="text-7xl">{formattedTimeRemaining}</div>;
};

export default CountdownMinutesAndSeconds;
