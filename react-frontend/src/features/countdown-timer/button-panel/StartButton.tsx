import useCountdownTimer from "@features/countdown-timer/hooks/useCountdownTimer.tsx";

const StartButton = () => {
    const { startCountdownWithSound } = useCountdownTimer();

    return (
        <button className="btn" onClick={startCountdownWithSound}>
            Start
        </button>
    );
};

export default StartButton;
