import useSkipCountdown from "@features/CountdownTimer/hooks/useSkipCountdown.tsx";

const SkipButton = () => {
    const { skipCountdown } = useSkipCountdown();

    return (
        <button className="btn" onClick={skipCountdown}>
            Skip
        </button>
    );
};

export default SkipButton;
