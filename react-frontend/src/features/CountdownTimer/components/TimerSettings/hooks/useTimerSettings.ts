import useInputInitialisation from "@features/CountdownTimer/components/TimerSettings/hooks/useInputInitialisation.ts";
import useAutoSyncTimer from "@features/CountdownTimer/hooks/useAutoSyncTimer.ts";

const useTimerSettings = () => {
    useInputInitialisation();
    useAutoSyncTimer();

    return;
};

export default useTimerSettings;
