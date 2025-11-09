import useCountdownTimer from "../../../hooks/CountdownTimer/useCountdownTimer.tsx";

const PauseButton = () => {
    const { pauseCountdown } = useCountdownTimer();

    return (
        <button className="btn" onClick={pauseCountdown}>
            Pause
        </button>
    );
};

export default PauseButton;
