import useCountdownTimer from "@hooks/CountdownTimer/useCountdownTimer";

const ResetButton = () => {
    const { resetCountdownWithSound } = useCountdownTimer();

    return (
        <button className="btn" onClick={resetCountdownWithSound}>
            Reset
        </button>
    );
};

export default ResetButton;
