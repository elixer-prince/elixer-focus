import useSessionContext from "@features/CountdownTimer/SessionDisplay/hooks/useSessionContext.tsx";

const SessionCount = () => {
    const { currentSessionCount, sessionCountLimit } = useSessionContext();

    return (
        <div className="absolute top-12 rounded-md border-2 border-white/50 px-2 py-1 font-bold">
            {currentSessionCount}/{sessionCountLimit}
        </div>
    );
};

export default SessionCount;
