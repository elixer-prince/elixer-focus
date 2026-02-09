import useInputInitialisation from "@/features/countdown-timer/components/TimerSettings/hooks/useInputInitialisation";
import useAutoSyncTimer from "@/features/countdown-timer/hooks/useAutoSyncTimer";

const useTimerSettings = () => {
  useInputInitialisation();
  useAutoSyncTimer();

  return;
};

export default useTimerSettings;
