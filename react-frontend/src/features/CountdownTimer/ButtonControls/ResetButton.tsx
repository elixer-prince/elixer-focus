import useResetCountdown from "@features/CountdownTimer/hooks/useResetCountdown.tsx";
import { VscDebugRestart } from "react-icons/vsc";

const ResetButton = () => {
    const { resetCountdownWithSound } = useResetCountdown();

    return (
        <button
            className="btn btn-error btn-soft"
            onClick={resetCountdownWithSound}
        >
            Reset <VscDebugRestart size={20} />
        </button>
    );
};

export default ResetButton;
