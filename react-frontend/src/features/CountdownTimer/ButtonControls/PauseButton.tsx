import usePauseCountdown from "@features/CountdownTimer/hooks/usePauseCountdown.tsx";

const PauseButton = () => {
    const { pauseCountdown } = usePauseCountdown();

    return (
        <button className="btn btn-primary" onClick={pauseCountdown}>
            Pause
        </button>
    );
};

export default PauseButton;
