import useSkipCountdown from "@/features/countdown-timer/hooks/useSkipCountdown";
import { MdSkipNext } from "react-icons/md";

const SkipButton = () => {
  const { skipCountdown } = useSkipCountdown();

  return (
    <button className={"btn btn-soft btn-warning"} onClick={skipCountdown}>
      <MdSkipNext size={24} />
      Skip
    </button>
  );
};

export default SkipButton;
