import useStartCountdown from "@features/CountdownTimer/hooks/useStartCountdown.tsx";
import { FaPlay } from "react-icons/fa";

const StartButton = () => {
    const { startCountdownWithSound } = useStartCountdown();

    return (
        // Start Button
        <button className="btn btn-primary" onClick={startCountdownWithSound}>
            <FaPlay size={12} />
            Start
        </button>
    );
};

export default StartButton;
