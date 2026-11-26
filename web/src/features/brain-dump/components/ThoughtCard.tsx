import { Button } from "@/components/ui";
import type { BrainDumpThought } from "@/features/brain-dump/types/brain-dump";
import { formatRelativeTime } from "@/utils/date";

export type ThoughtDraft = {
  content: string;
  error: string | null;
  notice: string | null;
};

type ThoughtCardProps = {
  thoughtId: string;
  thought: BrainDumpThought | null;
  draft?: ThoughtDraft;
  onEdit: () => void;
  onDraftChange: (content: string) => void;
  onBlur: (content: string) => void;
  onDelete: () => void;
  onSaveAsNew: () => void;
  onDiscard: () => void;
};

const getRows = (content: string) =>
  Math.min(Math.max(content.split("\n").length, 4), 8);

const ThoughtCard = ({
  thoughtId,
  thought,
  draft,
  onEdit,
  onDraftChange,
  onBlur,
  onDelete,
  onSaveAsNew,
  onDiscard,
}: ThoughtCardProps) => {
  const isOrphaned = thought === null;
  const isEditing = draft !== undefined;
  const editorId = `thought-editor-${thoughtId}`;
  const errorId = `${editorId}-error`;
  const noticeId = `${editorId}-notice`;
  const describedBy = [draft?.error && errorId, draft?.notice && noticeId]
    .filter(Boolean)
    .join(" ");

  return (
    <li
      className="bg-base-100 border-base-300 rounded-2xl border p-5 shadow-sm transition-colors duration-500 motion-reduce:transition-none max-sm:p-4"
      style={{ contentVisibility: "auto", containIntrinsicSize: "auto 10rem" }}
    >
      {isOrphaned && (
        <div
          className="alert alert-warning mb-4"
          role="status"
          aria-live="polite"
        >
          <span>
            This thought was removed in another tab. Save the draft as a new
            thought or discard it.
          </span>
        </div>
      )}

      {!isEditing && thought && (
        <>
          <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
            <time
              className="text-base-content/60 text-sm"
              dateTime={new Date(thought.createdAt).toISOString()}
            >
              {formatRelativeTime(thought.createdAt)}
            </time>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                color="ghost"
                size="sm"
                className="min-h-11"
                onClick={onEdit}
              >
                Edit
              </Button>
              <Button
                type="button"
                color="ghost"
                size="sm"
                className="text-error min-h-11"
                onClick={onDelete}
              >
                Delete
              </Button>
            </div>
          </div>
          <p className="text-base-content/90 max-w-prose text-base leading-relaxed break-words whitespace-pre-wrap">
            {thought.content}
          </p>
        </>
      )}

      {isEditing && draft && (
        <div className="space-y-3">
          {isOrphaned ? (
            <h3 className="text-base-content font-semibold">
              Draft from a deleted thought
            </h3>
          ) : (
            <time
              className="text-base-content/60 block text-sm"
              dateTime={new Date(thought.createdAt).toISOString()}
            >
              {formatRelativeTime(thought.createdAt)}
            </time>
          )}
          <label htmlFor={editorId} className="sr-only">
            {isOrphaned ? "Draft thought" : "Edit thought"}
          </label>
          <textarea
            id={editorId}
            name={`thought-${thoughtId}`}
            autoFocus
            rows={getRows(draft.content)}
            value={draft.content}
            onChange={(event) => onDraftChange(event.target.value)}
            onBlur={(event) => {
              if (!isOrphaned) onBlur(event.currentTarget.value);
            }}
            aria-invalid={Boolean(draft.error)}
            aria-describedby={describedBy || undefined}
            className="textarea textarea-primary bg-base-100 focus-visible:ring-primary max-h-48 min-h-28 w-full max-w-prose resize-none overflow-y-auto text-base leading-relaxed focus-visible:ring-2"
          />
          {draft.error && (
            <p id={errorId} className="text-error text-sm" role="alert">
              {draft.error}
            </p>
          )}
          {draft.notice && (
            <p
              id={noticeId}
              className="text-base-content/70 text-sm"
              role="status"
              aria-live="polite"
            >
              {draft.notice}
            </p>
          )}
          {isOrphaned && (
            <div className="flex flex-wrap justify-end gap-2">
              <Button
                type="button"
                color="ghost"
                size="sm"
                className="min-h-11"
                onClick={onDiscard}
              >
                Discard
              </Button>
              <Button
                type="button"
                size="sm"
                className="min-h-11"
                onClick={onSaveAsNew}
              >
                Save as new
              </Button>
            </div>
          )}
        </div>
      )}
    </li>
  );
};

export default ThoughtCard;
