import useStartCountdown from "@features/CountdownTimer/hooks/CountdownTimer/useStartCountdown";
import { FaPlay } from "react-icons/fa";

const StartButton = () => {
    const { startCountdownWithSound } = useStartCountdown();

    return (
        // Start Button
        <button
            className="btn btn-primary border border-red-500"
            onClick={startCountdownWithSound}
        >
            <FaPlay size={12} />
            Start
        </button>
    );
};

export default StartButton;
