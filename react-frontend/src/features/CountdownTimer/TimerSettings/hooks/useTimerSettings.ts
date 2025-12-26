import useInputInitialisation from "@features/CountdownTimer/TimerSettings/hooks/useInputInitialisation";
import useAutoSyncTimer from "@features/CountdownTimer/hooks/CountdownTimer/useAutoSyncTimer";

const useTimerSettings = () => {
    useInputInitialisation();
    useAutoSyncTimer();

    return;
};

export default useTimerSettings;
