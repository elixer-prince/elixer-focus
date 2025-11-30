import useSessionContext from "@features/CountdownTimer/SessionDisplay/hooks/useSessionContext.tsx";

const useCountdownSession = () => {
    const {
        currentSessionType,
        currentSessionCount,
        sessionCountLimit,
        setSessionCountLimit,
        setCurrentSessionType,
        setCurrentSessionCount,
        totalSessionsCompleted,
        setTotalSessionsCompleted,
        longBreakDuration,
        setLongBreakDuration,
        setShortBreakDuration,
        shortBreakDuration,
        setFocusDuration,
        focusDuration,
    } = useSessionContext();

    return {
        currentSessionType,
        currentSessionCount,
        sessionCountLimit,
        setSessionCountLimit,
        setCurrentSessionType,
        setCurrentSessionCount,
        totalSessionsCompleted,
        setTotalSessionsCompleted,
        longBreakDuration,
        setLongBreakDuration,
        setShortBreakDuration,
        shortBreakDuration,
        setFocusDuration,
        focusDuration,
    };
};

export default useCountdownSession;
