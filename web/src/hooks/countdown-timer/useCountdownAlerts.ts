import { useCurrentSessionType } from "@/stores/countdown-timer/session-store";
import toast from "react-hot-toast";

const useCountdownAlerts = () => {
  const currentSessionType = useCurrentSessionType();

  const alertUserOfTimerEnd = () => {};

  return { alertUserOfTimerEnd };
};

export default useCountdownAlerts;
