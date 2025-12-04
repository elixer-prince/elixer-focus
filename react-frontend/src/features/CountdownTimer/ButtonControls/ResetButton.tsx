import useResetCountdown from "@features/CountdownTimer/hooks/useResetCountdown.tsx";

const ResetButton = () => {
    const { resetCountdownWithSound } = useResetCountdown();

    return (
        <button className="btn" onClick={resetCountdownWithSound}>
            Reset
        </button>
    );
};

export default ResetButton;
