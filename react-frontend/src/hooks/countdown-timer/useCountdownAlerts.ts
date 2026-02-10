import { useCurrentSessionType } from "@/stores/countdown-timer/SessionStore";
import toast from "react-hot-toast";

const useCountdownAlerts = () => {
  const currentSessionType = useCurrentSessionType();

  // * Temp Locked * //
  const alertUserOfTimerEnd = () => {
    // TODO: Make this toast themed
    // ? I might convert this to a overlay
    toast(`Your ${currentSessionType} session has ended!`, {
      duration: 10000,
    });
  };

  return { alertUserOfTimerEnd };
};

export default useCountdownAlerts;
