import useCountdownTimer from "../../../hooks/CountdownTimer/useCountdownTimer.tsx";

const ResetButton = () => {
    const { resetCountdownWithSound } = useCountdownTimer();

    return (
        <button className="btn" onClick={resetCountdownWithSound}>
            Reset
        </button>
    );
};

export default ResetButton;
