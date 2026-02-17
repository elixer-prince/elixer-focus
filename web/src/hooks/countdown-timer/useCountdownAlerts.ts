import { useCurrentSessionType } from "@/stores/countdown-timer/session-store";

const useCountdownAlerts = () => {
  const currentSessionType = useCurrentSessionType();

  const alertUserOfTimerEnd = () => {};

  return { alertUserOfTimerEnd };
};

export default useCountdownAlerts;
