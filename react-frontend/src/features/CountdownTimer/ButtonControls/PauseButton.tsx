import usePauseCountdown from "@features/CountdownTimer/hooks/usePauseCountdown.tsx";

const PauseButton = () => {
    const { pauseCountdown } = usePauseCountdown();

    return (
        <button className="btn" onClick={pauseCountdown}>
            Pause
        </button>
    );
};

export default PauseButton;
