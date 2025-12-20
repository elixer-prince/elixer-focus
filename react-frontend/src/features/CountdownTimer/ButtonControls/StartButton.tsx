import useStartCountdown from "@features/CountdownTimer/hooks/useStartCountdown.tsx";
import { FaPlay } from "react-icons/fa";

const StartButton = () => {
    const { startCountdownWithSound } = useStartCountdown();

    return (
        <button className="btn btn-primary" onClick={startCountdownWithSound}>
            Start
            <FaPlay size={12} />
        </button>
    );
};

export default StartButton;
