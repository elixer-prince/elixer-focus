import useCountdownTimer from "../../../hooks/CountdownTimer/useCountdownTimer.tsx";

const StartButton = () => {
    const { startCountdown } = useCountdownTimer();

    return (
        <button className="btn" onClick={startCountdown}>
            Start
        </button>
    );
};

export default StartButton;
