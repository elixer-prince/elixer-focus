import {
  useCreateNote,
  useEntries,
  useJournalStore,
} from "@/features/journal/stores/journal-store";
import type { CompletedSession } from "@/features/countdown-timer/types/completed-session";
import { Button } from "@/components/ui";
import { format } from "date-fns";
import { useState } from "react";
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
  const entries = useEntries();
  const createNote = useCreateNote();
  const saveEntry = useJournalStore.getState().saveEntry;
  const [reflection, setReflection] = useState("");

  if (!isOpen || !session) return null;

  // Get the entry for the day the session was completed
  const sessionDate = format(new Date(session.completedAt), "yyyy-MM-dd");
  let entry = entries.find((e) => e.date === sessionDate);

  // Create entry if it doesn't exist
  if (!entry) {
    entry = saveEntry(sessionDate, "");
  }

  const handleSave = () => {
    if (reflection.trim()) {
      createNote(
        entry.id,
        `Reflection: ${session.sessionType}`,
        reflection.trim(),
        "reflection",
        session.id,
      );
    }
    setReflection("");
    onClose();
  };

  const handleSkip = () => {
    setReflection("");
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
          <h3 className="text-base-content text-lg font-bold">
            Session Reflection
          </h3>
          <Button size="xs" color="ghost" onClick={handleSkip}>
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

        <textarea
          className="textarea textarea-bordered textarea-primary mb-4 w-full"
          placeholder="What did you accomplish? How do you feel?"
          value={reflection}
          onChange={(e) => setReflection(e.target.value)}
          rows={4}
          autoFocus
        />

        <div className="modal-action">
          <Button size="sm" color="ghost" onClick={handleSkip}>
            Skip
          </Button>
          <Button size="sm" onClick={handleSave} disabled={!reflection.trim()}>
            Save Reflection
          </Button>
        </div>
      </div>
    </dialog>
  );
};

export default SessionReflection;
