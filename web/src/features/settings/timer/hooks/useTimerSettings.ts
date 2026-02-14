import useAutoSyncTimer from "@/features/countdown-timer/hooks/useAutoSyncTimer";
import useInputInitialisation from "@/features/settings/timer/hooks/useInputInitialisation";

const useTimerSettings = () => {
  useInputInitialisation();
  useAutoSyncTimer();

  return;
};

export default useTimerSettings;
