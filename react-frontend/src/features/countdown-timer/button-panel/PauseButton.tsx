import useCountdownTimer from "@features/countdown-timer/hooks/useCountdownTimer.tsx";

const PauseButton = () => {
    const { pauseCountdown } = useCountdownTimer();

    return (
        <button className="btn" onClick={pauseCountdown}>
            Pause
        </button>
    );
};

export default PauseButton;
