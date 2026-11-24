import SessionReflection from "@/features/journal/components/SessionReflection/Index";
import {
  useLastCompletedSession,
  useClearLastCompletedSession,
} from "@/features/countdown-timer/stores/session-history-store";
import type { CompletedSession } from "@/features/countdown-timer/types/completed-session";
import { useEffect, useState } from "react";

const SessionReflectionModal = () => {
  const lastCompletedSession = useLastCompletedSession();
  const clearLastCompletedSession = useClearLastCompletedSession();
  const [reflectionOpen, setReflectionOpen] = useState(false);
  const [pendingSession, setPendingSession] = useState<CompletedSession | null>(
    null,
  );

  useEffect(() => {
    if (lastCompletedSession && !reflectionOpen) {
      setPendingSession(lastCompletedSession);
      setReflectionOpen(true);
    }
  }, [lastCompletedSession, reflectionOpen]);

  return (
    <SessionReflection
      session={pendingSession}
      isOpen={reflectionOpen}
      onClose={() => {
        setReflectionOpen(false);
        setPendingSession(null);
        clearLastCompletedSession();
      }}
    />
  );
};

export default SessionReflectionModal;
