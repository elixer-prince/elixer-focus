import useResetCountdown from "@features/CountdownTimer/hooks/useResetCountdown.tsx";

const ResetButton = () => {
    const { resetCountdownWithSound } = useResetCountdown();

    return (
        <button className="btn btn-error btn-soft" onClick={resetCountdownWithSound}>
            Reset
        </button>
    );
};

export default ResetButton;
