import SessionReflection from "@/features/journal/components/SessionReflection/Index";
import { useLastCompletedSession } from "@/features/countdown-timer/stores/session-history-store";

const SessionReflectionModal = () => {
  const lastCompletedSession = useLastCompletedSession();

  return (
    <SessionReflection
      session={lastCompletedSession}
      isOpen={lastCompletedSession !== null}
      onClose={() => undefined}
    />
  );
};

export default SessionReflectionModal;
