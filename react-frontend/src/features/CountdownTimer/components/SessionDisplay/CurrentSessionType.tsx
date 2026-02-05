import { useSessionContext } from "@features/CountdownTimer/stores/SessionContext.tsx";
import { currentSessionTypeStyles } from "@features/CountdownTimer/components/SessionDisplay/styles.ts";

const CurrentSessionType = () => {
    const { currentSessionType } = useSessionContext();

    return (
        <p className={currentSessionTypeStyles}>{currentSessionType} Session</p>
    );
};

export default CurrentSessionType;
