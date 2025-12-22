import usePauseCountdown from "@features/CountdownTimer/hooks/usePauseCountdown.tsx";
import { FaPause } from "react-icons/fa";

const PauseButton = () => {
    const { pauseCountdown } = usePauseCountdown();

    return (
        // Pause Button
        <button className="btn btn-primary" onClick={pauseCountdown}>
            <FaPause size={12} />
            Pause
        </button>
    );
};

export default PauseButton;
