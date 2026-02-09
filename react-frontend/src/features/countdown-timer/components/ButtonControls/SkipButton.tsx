import useSkipCountdown from "@/hooks/countdown-timer/useSkipCountdown";
import { IoIosSkipForward } from "react-icons/io";

const SkipButton = () => {
  const { skipCountdown } = useSkipCountdown();

  return (
    <button className={"btn btn-soft btn-warning"} onClick={skipCountdown}>
      <IoIosSkipForward size={18} />
      Skip
    </button>
  );
};

export default SkipButton;
