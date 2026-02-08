import { useCurrentSessionType } from "@/features/CountdownTimer/stores/SessionStore";

const CurrentSessionType = () => {
  const currentSessionType = useCurrentSessionType();

  return (
    <h2 className={"text-center text-4xl font-bold"}>
      {currentSessionType} <span className={"max-sm:hidden"}>Session</span>
    </h2>
  );
};

export default CurrentSessionType;
