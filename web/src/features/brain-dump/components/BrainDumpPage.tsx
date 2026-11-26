import { Button, Input, Modal, Skeleton } from "@/components/ui";
import ThoughtCapture from "@/features/brain-dump/components/ThoughtCapture";
import ThoughtCard, {
  type ThoughtDraft,
} from "@/features/brain-dump/components/ThoughtCard";
import {
  dispatchBrainDumpCommand,
  retryReadBrainDumpThoughts,
} from "@/features/brain-dump/services/brain-dump-coordinator";
import type { BrainDumpThought } from "@/features/brain-dump/types/brain-dump";
import {
  useBrainDumpCrossTabSupported,
  useBrainDumpReadError,
  useBrainDumpReadStatus,
  useBrainDumpThoughts,
} from "@/stores";
import useErrorToast from "@/hooks/useErrorToast";
import usePageTitle from "@/hooks/usePageTitle";
import { getCurrentTimestamp } from "@/utils/date";
import { useCallback, useEffect, useRef, useState } from "react";
import { MdOutlineLightbulb } from "react-icons/md";
import { useTimerRunning } from "@/features/countdown-timer/stores/countdown-store";

const DELETE_PREVIEW_LENGTH = 160;

const removeDraft = (
  drafts: Record<string, ThoughtDraft>,
  id: string,
): Record<string, ThoughtDraft> => {
  const { [id]: _removed, ...remaining } = drafts;
  return remaining;
};

const BrainDumpPage = () => {
  const thoughts = useBrainDumpThoughts();
  const readStatus = useBrainDumpReadStatus();
  const readError = useBrainDumpReadError();
  const crossTabSupported = useBrainDumpCrossTabSupported();
  const { showError } = useErrorToast();
  const { updatePageTitle } = usePageTitle();
  const timerRunning = useTimerRunning();
  const [searchQuery, setSearchQuery] = useState("");
  const [editingDrafts, setEditingDrafts] = useState<
    Record<string, ThoughtDraft>
  >({});
  const [deleteTarget, setDeleteTarget] = useState<BrainDumpThought | null>(
    null,
  );
  const [isDeleting, setIsDeleting] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const editTimers = useRef(new Map<string, ReturnType<typeof setTimeout>>());
  const captureRef = useRef<HTMLTextAreaElement | null>(null);
  const searchRef = useRef<HTMLInputElement | null>(null);

  const focusCapture = () => {
    window.setTimeout(() => captureRef.current?.focus(), 0);
  };

  useEffect(() => {
    if (!timerRunning) updatePageTitle("Elixer Focus - Brain dump");
  }, [timerRunning, updatePageTitle]);

  useEffect(
    () => () => {
      editTimers.current.forEach((timer) => clearTimeout(timer));
    },
    [],
  );

  const clearEditTimer = useCallback((id: string) => {
    const timer = editTimers.current.get(id);
    if (timer) clearTimeout(timer);
    editTimers.current.delete(id);
  }, []);

  const handleAdd = async (content: string) => {
    if (readStatus !== "ready") return false;
    const commandId = crypto.randomUUID();
    const result = await dispatchBrainDumpCommand({
      type: "add",
      commandId,
      thoughtId: crypto.randomUUID(),
      content,
      createdAt: getCurrentTimestamp(),
    });
    if (!result.success) {
      showError(result.error, { title: "Brain dump changes were not saved" });
      return false;
    }
    return true;
  };

  const saveEdit = useCallback(
    async (id: string, content: string, endEditing: boolean) => {
      const trimmedContent = content.trim();
      if (!trimmedContent) {
        setEditingDrafts((current) => ({
          ...current,
          [id]: {
            ...current[id],
            content,
            error: "A thought cannot be empty.",
            notice: null,
          },
        }));
        return;
      }

      const result = await dispatchBrainDumpCommand({
        type: "update",
        commandId: crypto.randomUUID(),
        thoughtId: id,
        content: trimmedContent,
        updatedAt: getCurrentTimestamp(),
      });
      if (!result.success) {
        showError(result.error, { title: "Brain dump changes were not saved" });
        return;
      }

      if (result.outcome === "deleted-elsewhere") {
        setEditingDrafts((current) => ({
          ...current,
          [id]: {
            ...current[id],
            content,
            error: null,
            notice:
              "This thought was removed in another tab. Save the draft as a new thought or discard it.",
          },
        }));
        return;
      }

      if (result.outcome === "superseded") {
        setEditingDrafts((current) => ({
          ...current,
          [id]: {
            ...current[id],
            content: result.thought?.content ?? trimmedContent,
            error: null,
            notice:
              "A newer edit was saved in another tab. The latest text is shown.",
          },
        }));
        return;
      }

      if (endEditing) {
        clearEditTimer(id);
        setEditingDrafts((current) => removeDraft(current, id));
      } else {
        setEditingDrafts((current) => ({
          ...current,
          [id]: {
            ...current[id],
            content: result.thought?.content ?? trimmedContent,
            error: null,
            notice: null,
          },
        }));
      }
    },
    [clearEditTimer, showError],
  );

  const handleDraftChange = (id: string, content: string) => {
    setEditingDrafts((current) => ({
      ...current,
      [id]: { ...current[id], content, error: null, notice: null },
    }));
    clearEditTimer(id);
    if (thoughts.some((thought) => thought.id === id)) {
      editTimers.current.set(
        id,
        setTimeout(() => {
          editTimers.current.delete(id);
          void saveEdit(id, content, false);
        }, 1000),
      );
    }
  };

  const handleEditBlur = (id: string, content: string) => {
    clearEditTimer(id);
    void saveEdit(id, content, true);
  };

  const handleSaveAsNew = async (id: string) => {
    const draft = editingDrafts[id];
    if (!draft || readStatus !== "ready") return;
    if (!draft.content.trim()) {
      setEditingDrafts((current) => ({
        ...current,
        [id]: {
          ...current[id],
          error: "A thought cannot be empty.",
          notice: null,
        },
      }));
      return;
    }

    const commandId = crypto.randomUUID();
    const result = await dispatchBrainDumpCommand({
      type: "add",
      commandId,
      thoughtId: crypto.randomUUID(),
      content: draft.content,
      createdAt: getCurrentTimestamp(),
    });
    if (!result.success) {
      showError(result.error, { title: "Brain dump changes were not saved" });
      return;
    }

    clearEditTimer(id);
    setEditingDrafts((current) => removeDraft(current, id));
    setSearchQuery("");
    focusCapture();
  };

  const handleDiscardDraft = (id: string) => {
    clearEditTimer(id);
    setEditingDrafts((current) => removeDraft(current, id));
    focusCapture();
  };

  const handleDelete = async () => {
    if (!deleteTarget || isDeleting) return;
    setIsDeleting(true);
    try {
      const result = await dispatchBrainDumpCommand({
        type: "delete",
        commandId: crypto.randomUUID(),
        thoughtId: deleteTarget.id,
      });
      if (!result.success) {
        showError(result.error, {
          title: "Brain dump changes were not saved",
        });
        return;
      }
      setDeleteTarget(null);
      focusCapture();
    } finally {
      setIsDeleting(false);
    }
  };

  const handleRetryRead = async () => {
    setIsRetrying(true);
    try {
      const result = await retryReadBrainDumpThoughts();
      if (result.success) focusCapture();
    } finally {
      setIsRetrying(false);
    }
  };

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const visibleThoughts = thoughts.filter(
    (thought) =>
      editingDrafts[thought.id] ||
      !normalizedQuery ||
      thought.content.toLowerCase().includes(normalizedQuery),
  );
  const orphanedDrafts = Object.entries(editingDrafts).filter(
    ([id]) => !thoughts.some((thought) => thought.id === id),
  );
  const hasNoSearchMatches =
    thoughts.length > 0 &&
    normalizedQuery.length > 0 &&
    visibleThoughts.length === 0 &&
    orphanedDrafts.length === 0;
  const deletePreview = deleteTarget
    ? deleteTarget.content.length > DELETE_PREVIEW_LENGTH
      ? `${deleteTarget.content.slice(0, DELETE_PREVIEW_LENGTH)}…`
      : deleteTarget.content
    : "";

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-8 max-sm:px-4">
      <header className="border-base-300 bg-base-200 flex items-center gap-4 rounded-3xl border p-6 max-sm:items-start max-sm:p-5">
        <div className="bg-primary/10 text-primary flex size-14 shrink-0 items-center justify-center rounded-2xl max-sm:size-12">
          <MdOutlineLightbulb size={28} aria-hidden="true" focusable="false" />
        </div>
        <div className="min-w-0">
          <p className="text-primary mb-1 text-xs font-bold tracking-[0.16em] uppercase">
            Personal inbox
          </p>
          <h1 className="text-base-content text-2xl font-bold text-pretty">
            Brain dump
          </h1>
          <p className="text-base-content/70 mt-1 text-sm leading-relaxed">
            Capture what's on your mind. Sort it out later.
          </p>
        </div>
      </header>

      {readStatus === "ready" && !crossTabSupported && (
        <div
          className="alert alert-warning border-warning/30 bg-warning/10 text-base-content rounded-2xl"
          role="status"
          aria-live="polite"
        >
          <span>
            Cross tab sync is unavailable. Brain dump will work in this tab
            only.
          </span>
        </div>
      )}

      <section className="card border-base-300 bg-base-100 rounded-3xl border shadow-sm">
        <div className="card-body gap-5 p-6 max-sm:p-5">
          <div>
            <h2 className="text-base-content text-lg font-semibold">
              Quick capture
            </h2>
            <p className="text-base-content/60 mt-1 text-sm">
              Write freely. You can decide what to do with it later.
            </p>
          </div>
          <ThoughtCapture
            ref={captureRef}
            canSave={readStatus === "ready"}
            onAdd={handleAdd}
            onAdded={() => setSearchQuery("")}
          />
        </div>
      </section>

      {readStatus === "loading" && (
        <div className="space-y-3">
          <Skeleton className="h-6 w-40" aria-label="Loading saved thoughts" />
          <Skeleton className="h-28 w-full rounded-2xl" aria-hidden="true" />
        </div>
      )}

      {readStatus === "error" && (
        <section
          className="alert alert-error flex flex-col items-start gap-4 rounded-2xl sm:flex-row sm:items-center sm:justify-between"
          aria-labelledby="brain-dump-read-error-title"
          role="alert"
        >
          <div>
            <h2 id="brain-dump-read-error-title" className="font-semibold">
              Your saved thoughts could not be loaded
            </h2>
            <p className="mt-1 text-sm">
              {readError} The stored value has not been changed. Retry after
              checking that browser storage is available.
            </p>
          </div>
          <Button
            type="button"
            color="neutral"
            loading={isRetrying}
            onClick={handleRetryRead}
          >
            Retry
          </Button>
        </section>
      )}

      {readStatus === "ready" && (
        <section
          className="space-y-4"
          aria-labelledby="brain-dump-thoughts-title"
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2
                id="brain-dump-thoughts-title"
                className="text-base-content text-xl font-semibold"
              >
                Your thoughts
              </h2>
              <p className="text-base-content/60 mt-1 text-sm">
                Keep them here until you’re ready to sort them out.
              </p>
            </div>
            {thoughts.length > 0 && (
              <div className="w-full sm:max-w-sm">
                <Input
                  ref={searchRef}
                  label="Search thoughts"
                  type="search"
                  name="thought-search"
                  autoComplete="off"
                  inputSize="md"
                  placeholder="Search your thoughts…"
                  helperText="Search saved thought text as you type."
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                />
              </div>
            )}
          </div>

          {thoughts.length === 0 && orphanedDrafts.length === 0 ? (
            <div className="bg-base-200/60 border-base-300 rounded-2xl border border-dashed px-6 py-10 text-center">
              <h3 className="text-base-content font-semibold">
                Nothing captured yet
              </h3>
              <p className="text-base-content/60 mx-auto mt-2 max-w-prose text-sm leading-relaxed">
                Add a thought above. You can leave it unclassified until you’re
                ready to decide what it means.
              </p>
            </div>
          ) : hasNoSearchMatches ? (
            <div className="bg-base-200/60 border-base-300 flex flex-col items-center gap-3 rounded-2xl border border-dashed px-6 py-10 text-center">
              <p className="text-base-content/70">
                No thoughts match “{searchQuery.trim()}”.
              </p>
              <Button
                type="button"
                color="ghost"
                className="min-h-11"
                onClick={() => {
                  setSearchQuery("");
                  window.setTimeout(() => searchRef.current?.focus(), 0);
                }}
              >
                Clear search
              </Button>
            </div>
          ) : (
            <ul className="space-y-3" aria-label="Saved thoughts">
              {visibleThoughts.map((thought) => (
                <ThoughtCard
                  key={thought.id}
                  thoughtId={thought.id}
                  thought={thought}
                  draft={editingDrafts[thought.id]}
                  onEdit={() =>
                    setEditingDrafts((current) => ({
                      ...current,
                      [thought.id]: {
                        content: thought.content,
                        error: null,
                        notice: null,
                      },
                    }))
                  }
                  onDraftChange={(content) =>
                    handleDraftChange(thought.id, content)
                  }
                  onBlur={(content) => handleEditBlur(thought.id, content)}
                  onDelete={() => setDeleteTarget(thought)}
                  onSaveAsNew={() => void handleSaveAsNew(thought.id)}
                  onDiscard={() => handleDiscardDraft(thought.id)}
                />
              ))}
              {orphanedDrafts.map(([id, draft]) => (
                <ThoughtCard
                  key={id}
                  thoughtId={id}
                  thought={null}
                  draft={draft}
                  onEdit={() => undefined}
                  onDraftChange={(content) => handleDraftChange(id, content)}
                  onBlur={() => undefined}
                  onDelete={() => undefined}
                  onSaveAsNew={() => void handleSaveAsNew(id)}
                  onDiscard={() => handleDiscardDraft(id)}
                />
              ))}
            </ul>
          )}
        </section>
      )}

      <Modal
        isOpen={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        title="Delete this thought?"
        showCloseButton={false}
      >
        <p className="text-base-content/70 text-sm">
          This will permanently remove the saved thought.
        </p>
        <p className="bg-base-200 mt-4 max-h-32 overflow-y-auto rounded-xl p-4 text-sm leading-relaxed break-words whitespace-pre-wrap">
          {deletePreview}
        </p>
        <div className="modal-action">
          <Button
            type="button"
            color="ghost"
            onClick={() => setDeleteTarget(null)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            color="primary"
            loading={isDeleting}
            onClick={handleDelete}
          >
            Delete
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default BrainDumpPage;
