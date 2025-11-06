import useCountdownTimer from "../../../hooks/CountdownTimer/useCountdownTimer.tsx";

const PauseButton = () => {
    const { stopCountdown } = useCountdownTimer();

    return (
        <button className="btn" onClick={stopCountdown}>
            Pause
        </button>
    );
};

export default PauseButton;
