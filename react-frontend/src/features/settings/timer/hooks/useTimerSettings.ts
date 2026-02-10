import useInputInitialisation from "@/features/settings/timer/hooks/useInputInitialisation.ts";
import useAutoSyncTimer from "@/features/countdown-timer/hooks/useAutoSyncTimer.ts";

const useTimerSettings = () => {
  useInputInitialisation();
  useAutoSyncTimer();

  return;
};

export default useTimerSettings;
