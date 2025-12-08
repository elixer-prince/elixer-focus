import useSessionContext from "@features/CountdownTimer/hooks/useSessionContext.tsx";

const SessionTypeHeader = () => {
    const { currentSessionType } = useSessionContext();

    return (
        <p className="text-center text-4xl font-bold">
            {currentSessionType} Session
        </p>
    );
};

export default SessionTypeHeader;
