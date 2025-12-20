import useSessionContext from "@features/CountdownTimer/hooks/useSessionContext.tsx";

const SessionCount = () => {
    const { currentSessionCount, sessionCountLimit } = useSessionContext();

    return (
        <div className="bg-base-100 border-primary/25 border-t-primary group-hover:border-primary/55 group-hover:border-t-primary group-hover:shadow-primary/25 absolute top-12 rounded-md border-2 px-2 py-1 font-bold transition-all duration-1000 group-hover:shadow-[0_0_18px_var(--p)]">
            {currentSessionCount} <span className="text-primary">/</span>{" "}
            {sessionCountLimit}
        </div>
    );
};

export default SessionCount;
