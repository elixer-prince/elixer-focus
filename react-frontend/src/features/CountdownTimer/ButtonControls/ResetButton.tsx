import useResetCountdown from "@features/CountdownTimer/hooks/useResetCountdown.tsx";
import { VscDebugRestart } from "react-icons/vsc";

const ResetButton = () => {
    const { resetCountdownWithSound } = useResetCountdown();

    return (
        // Reset Button
        <button
            className="btn btn-error btn-soft"
            onClick={resetCountdownWithSound}
        >
            <VscDebugRestart size={20} />
            Reset
        </button>
    );
};

export default ResetButton;
