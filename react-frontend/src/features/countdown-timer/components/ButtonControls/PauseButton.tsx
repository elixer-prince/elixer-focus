import usePauseCountdown from "@/hooks/countdown-timer/usePauseCountdown";
import { MdPause } from "react-icons/md";

const PauseButton = () => {
  const { pauseCountdown } = usePauseCountdown();

  return (
    <button className={"btn btn-primary"} onClick={pauseCountdown}>
      <MdPause size={20} />
      <span className={"max-sm:hidden"}>Pause</span>
    </button>
  );
};

export default PauseButton;
