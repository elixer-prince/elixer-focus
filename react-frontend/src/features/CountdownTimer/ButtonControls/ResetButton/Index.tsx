import useCountdownTimer from "@features/CountdownTimer/hooks/useCountdownTimer.tsx";

const ResetButton = () => {
    const { resetCountdownWithSound } = useCountdownTimer();

    return (
        <button className="btn" onClick={resetCountdownWithSound}>
            Reset
        </button>
    );
};

export default ResetButton;
