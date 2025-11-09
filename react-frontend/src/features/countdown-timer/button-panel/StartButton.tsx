import useCountdownTimer from "@hooks/CountdownTimer/useCountdownTimer";

const StartButton = () => {
    const { startCountdownWithSound } = useCountdownTimer();

    return (
        <button className="btn" onClick={startCountdownWithSound}>
            Start
        </button>
    );
};

export default StartButton;
