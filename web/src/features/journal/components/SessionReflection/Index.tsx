import type { CompletedSession } from "@/features/countdown-timer/types/completed-session";
import {
  useReflectionDraft,
  useTrackedIntervals,
} from "@/features/countdown-timer/stores/session-history-store";
import {
  broadcastReflectionDraft,
  requestReflectionResolution,
} from "@/features/countdown-timer/services/timer-coordinator";
import { Button } from "@/components/ui";
import { formatElapsedTime } from "@/utils/formatting";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { MdClose } from "react-icons/md";

type SessionReflectionProps = {
  session: CompletedSession | null;
  isOpen: boolean;
  onClose: () => void;
};

const SessionReflection = ({
  session,
  isOpen,
  onClose,
}: SessionReflectionProps) => {
  const reflection = useReflectionDraft();
  const trackedIntervals = useTrackedIntervals();
  const [localReflection, setLocalReflection] = useState(reflection);
  const [now, setNow] = useState(Date.now());

  const overrunInterval = trackedIntervals.find(
    (interval) =>
      interval.kind === "overrun" && interval.sessionId === session?.id,
  );
  const idleAfterCompletion = trackedIntervals.find(
    (interval) =>
      interval.kind === "idle" &&
      interval.endedAt === null &&
      session !== null &&
      interval.startedAt >= session.completedAt,
  );
  const elapsedInterval = overrunInterval ?? idleAfterCompletion;

  useEffect(() => {
    setLocalReflection(reflection);
  }, [reflection, session?.id]);

  useEffect(() => {
    if (!isOpen || !elapsedInterval || elapsedInterval.endedAt !== null) return;
    const intervalId = setInterval(() => setNow(Date.now()), 1_000);
    return () => clearInterval(intervalId);
  }, [isOpen, elapsedInterval]);

  if (!isOpen || !session) return null;

  const handleSave = () => {
    if (localReflection.trim()) {
      requestReflectionResolution(session.id, localReflection, true);
      toast.success("Reflection saved to journal");
    } else {
      requestReflectionResolution(session.id, "", false);
    }
    onClose();
  };

  const handleSkip = () => {
    requestReflectionResolution(session.id, localReflection, false);
    onClose();
  };

  return (
    <dialog
      id="session-reflection-modal"
      className="modal modal-open"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleSkip();
      }}
    >
      <div className="modal-box max-w-lg">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base-content text-lg font-bold">
            Session Reflection
          </h2>
          <Button
            size="xs"
            color="ghost"
            aria-label="Close session reflection"
            onClick={handleSkip}
          >
            <MdClose size={18} />
          </Button>
        </div>

        <div className="bg-primary/10 mb-4 rounded-lg p-3">
          <p className="text-base-content/70 text-sm">
            You just completed a{" "}
            <span className="text-primary font-semibold">
              {session.sessionType}
            </span>{" "}
            session.
          </p>
        </div>

        {elapsedInterval && (
          <div className="bg-base-200 mb-4 rounded-lg p-3" role="status">
            <p className="text-base-content/60 text-sm">
              {overrunInterval
                ? `Overrun for ${session.sessionType}`
                : "Time since session end"}
            </p>
            {!overrunInterval && (
              <p className="text-base-content/60 text-sm">
                This time is counted as idle.
              </p>
            )}
            <p className="text-primary text-xl font-semibold">
              {formatElapsedTime(
                Math.max(
                  0,
                  Math.floor(
                    ((elapsedInterval.endedAt ?? now) -
                      elapsedInterval.startedAt) /
                      1_000,
                  ),
                ),
              )}
            </p>
          </div>
        )}

        <textarea
          className="textarea textarea-bordered textarea-primary mb-4 w-full"
          aria-label="Session reflection"
          placeholder="What did you accomplish? How do you feel?"
          value={localReflection}
          onChange={(e) => {
            setLocalReflection(e.target.value);
            broadcastReflectionDraft(e.target.value);
          }}
          rows={4}
          autoFocus
        />

        <div className="modal-action">
          <Button size="sm" color="ghost" onClick={handleSkip}>
            Skip
          </Button>
          <Button
            size="sm"
            onClick={handleSave}
            disabled={!localReflection.trim()}
          >
            Save Reflection
          </Button>
        </div>
      </div>
    </dialog>
  );
};

export default SessionReflection;
