import useSkipCountdown from "@features/CountdownTimer/hooks/useSkipCountdown.tsx";
import { IoIosSkipForward } from "react-icons/io";

const SkipButton = () => {
    const { skipCountdown } = useSkipCountdown();

    return (
        // Skip Button
        <button className="btn btn-soft btn-warning" onClick={skipCountdown}>
            Skip
            <IoIosSkipForward size={18} />
        </button>
    );
};

export default SkipButton;
