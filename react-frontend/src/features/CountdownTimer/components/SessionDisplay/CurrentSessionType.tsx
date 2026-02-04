import { useSessionContext } from "@features/CountdownTimer/stores/SessionContext.tsx";

const CurrentSessionType = () => {
    const { currentSessionType } = useSessionContext();

    return (
        // Current Session Type
        <p className={"text-center text-4xl font-bold"}>
            {currentSessionType} Session
        </p>
    );
};

export default CurrentSessionType;
