import useSessionContext from "@features/CountdownTimer/SessionDisplay/hooks/useSessionContext.tsx";

const SessionCount = () => {
    const { currentSessionCount, sessionCountLimit } = useSessionContext();

    return (
        <div className="bg-base-100 border-primary/25 border-t-primary group-hover:border-primary/55 group-hover:border-t-primary absolute top-12 rounded-md border px-2 py-1 font-bold transition-colors duration-1000">
            {currentSessionCount} <span className="text-primary">/</span>{" "}
            {sessionCountLimit}
        </div>
    );
};

export default SessionCount;
