import useStartCountdown from "@features/CountdownTimer/hooks/useStartCountdown.tsx";

const StartButton = () => {
    const { startCountdownWithSound } = useStartCountdown();

    return (
        <button className="btn btn-primary" onClick={startCountdownWithSound}>
            Start
        </button>
    );
};

export default StartButton;
