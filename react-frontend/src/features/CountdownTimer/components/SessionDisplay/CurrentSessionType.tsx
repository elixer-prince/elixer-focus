import { useSessionContext } from "@/features/CountdownTimer/stores/SessionContext.tsx";

const CurrentSessionType = () => {
  const { currentSessionType } = useSessionContext();

  return (
    <h2 className={"text-center text-4xl font-bold"}>
      {currentSessionType} <span className={"max-sm:hidden"}>Session</span>
    </h2>
  );
};

export default CurrentSessionType;
