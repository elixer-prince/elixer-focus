import useResetCountdown from "@/hooks/countdown-timer/useResetCountdown";
import { MdReplay } from "react-icons/md";

const ResetButton = () => {
  const { resetCountdownWithSound } = useResetCountdown();

  return (
    <button
      className={"btn btn-error btn-soft"}
      onClick={resetCountdownWithSound}
    >
      <MdReplay size={24} />
      Reset
    </button>
  );
};

export default ResetButton;
