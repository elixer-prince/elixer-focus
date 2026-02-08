import usePauseCountdown from "@/features/CountdownTimer/hooks/usePauseCountdown";
import { FaPause } from "react-icons/fa";

const PauseButton = () => {
  const { pauseCountdown } = usePauseCountdown();

  return (
    <button className={"btn btn-primary"} onClick={pauseCountdown}>
      <FaPause size={12} />
      Pause
    </button>
  );
};

export default PauseButton;
