import useSkipCountdown from "@features/CountdownTimer/hooks/useSkipCountdown.tsx";

const SkipButton = () => {
    const { skipCountdown } = useSkipCountdown();

    return (
        <button className="btn btn-soft btn-warning" onClick={skipCountdown}>
            Skip
        </button>
    );
};

export default SkipButton;
