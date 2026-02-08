import useInputInitialisation from "@/features/CountdownTimer/components/TimerSettings/hooks/useInputInitialisation";
import useAutoSyncTimer from "@/features/CountdownTimer/hooks/useAutoSyncTimer";

const useTimerSettings = () => {
  useInputInitialisation();
  useAutoSyncTimer();

  return;
};

export default useTimerSettings;
