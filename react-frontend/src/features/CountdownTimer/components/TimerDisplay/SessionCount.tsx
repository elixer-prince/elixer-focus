import { useSessionContext } from "@features/CountdownTimer/stores/SessionContext.tsx";
import { sessionCountStyles } from "@features/CountdownTimer/components/TimerDisplay/styles.ts";

const SessionCount = () => {
    const { currentSessionCount, sessionCountLimit } = useSessionContext();

    return (
        <div className={sessionCountStyles}>
            {currentSessionCount} <span className="text-primary">/</span>{" "}
            {sessionCountLimit}
        </div>
    );
};

export default SessionCount;
