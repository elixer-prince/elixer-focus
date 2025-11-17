import useSessionContext from "@features/CountdownTimer/SessionDisplay/hooks/useSessionContext.tsx";

const useCountdownSession = () => {
    const { currentSessionType } = useSessionContext();

    return { currentSessionType };
};

export default useCountdownSession;
