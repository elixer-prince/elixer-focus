import useStartTimer from "../../../hooks/useStartCountdown.tsx";

const StartButton = () => {
    const [startCountdownTimer] = useStartTimer();

    return (
        <button className="btn" onClick={startCountdownTimer}>
            Start
        </button>
    );
};

export default StartButton;
