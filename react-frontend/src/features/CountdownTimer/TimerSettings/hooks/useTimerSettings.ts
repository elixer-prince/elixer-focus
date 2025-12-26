import useInputInitialisation from "@/";
import useAutoSyncTimer from "@features/CountdownTimer/hooks/CountdownTimer/useAutoSyncTimer.tsx";

const useTimerSettings = () => {
    useInputInitialisation();
    useAutoSyncTimer();

    return;
};

export default useTimerSettings;
