import useStartCountdown from "@features/CountdownTimer/hooks/useStartCountdown.tsx";

const StartButton = () => {
    const { startCountdownWithSound } = useStartCountdown();

    return (
        <button className="btn" onClick={startCountdownWithSound}>
            Start
        </button>
    );
};

export default StartButton;
