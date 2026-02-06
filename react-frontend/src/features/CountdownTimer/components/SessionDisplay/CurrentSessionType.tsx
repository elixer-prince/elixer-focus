import { useSessionContext } from "@/features/CountdownTimer/stores/SessionContext.tsx";

const CurrentSessionType = () => {
    const { currentSessionType } = useSessionContext();

    return (
        <p className={"text-center text-4xl font-bold"}>
            {currentSessionType} Session
        </p>
    );
};

export default CurrentSessionType;
