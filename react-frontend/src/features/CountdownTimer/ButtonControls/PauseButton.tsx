import usePauseCountdown from "@features/CountdownTimer/hooks/usePauseCountdown.tsx";
import { FaPause } from "react-icons/fa";

const PauseButton = () => {
    const { pauseCountdown } = usePauseCountdown();

    return (
        <button className="btn btn-primary" onClick={pauseCountdown}>
            Pause
            <FaPause size={12} />
        </button>
    );
};

export default PauseButton;
