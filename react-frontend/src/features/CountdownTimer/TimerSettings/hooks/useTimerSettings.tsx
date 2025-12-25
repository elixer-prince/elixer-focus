import useInputInitialisation from "@features/CountdownTimer/TimerSettings/hooks/useInputInitialisation.tsx";
import useAutoSyncTimer from "@features/CountdownTimer/hooks/CountdownTimer/useAutoSyncTimer.tsx";

const useTimerSettings = () => {
    useInputInitialisation();
    useAutoSyncTimer();

    return;
};

export default useTimerSettings;
