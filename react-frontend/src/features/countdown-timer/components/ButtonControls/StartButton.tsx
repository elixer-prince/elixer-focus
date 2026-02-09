import useStartCountdown from "@/hooks/countdown-timer/useStartCountdown";
import { FaPlay } from "react-icons/fa";

const StartButton = () => {
  const { startCountdownWithSound } = useStartCountdown();

  return (
    <button className={"btn btn-primary"} onClick={startCountdownWithSound}>
      <FaPlay size={12} />
      <span className={"max-sm:hidden"}>Start</span>
    </button>
  );
};

export default StartButton;
