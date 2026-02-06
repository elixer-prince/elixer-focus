import useStartCountdown from "@/features/CountdownTimer/hooks/useStartCountdown.ts";
import { FaPlay } from "react-icons/fa";

const StartButton = () => {
    const { startCountdownWithSound } = useStartCountdown();

    return (
        <button className={"btn btn-primary"} onClick={startCountdownWithSound}>
            <FaPlay size={12} />
            Start
        </button>
    );
};

export default StartButton;
