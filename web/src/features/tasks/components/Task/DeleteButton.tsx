import { Button } from "@/components/ui";
import { useRemoveTask } from "@/stores";
import { useEffect, useRef, useState } from "react";

interface DeleteButtonProps {
  id: string;
  isCompleted: boolean;
  subtaskCount?: number;
}

const DeleteButton = ({
  id,
  isCompleted,
  subtaskCount = 0,
}: DeleteButtonProps) => {
  const removeTask = useRemoveTask();
  const [isConfirming, setIsConfirming] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const deleteButtonRef = useRef<HTMLButtonElement>(null);
  const cancelButtonRef = useRef<HTMLButtonElement>(null);
  const confirmButtonRef = useRef<HTMLButtonElement>(null);
  const shouldFocusDeleteAfterCancel = useRef(false);

  useEffect(() => {
    if (isConfirming) {
      cancelButtonRef.current?.focus();
    } else if (shouldFocusDeleteAfterCancel.current) {
      deleteButtonRef.current?.focus();
      shouldFocusDeleteAfterCancel.current = false;
    }
  }, [isConfirming]);

  const handleRemove = async () => {
    if (isRemoving) return;
    const item = (confirmButtonRef.current ?? deleteButtonRef.current)?.closest(
      "li",
    );
    const nextTask = item?.nextElementSibling as HTMLElement | null;
    const previousTask = item?.previousElementSibling as HTMLElement | null;
    const focusTarget =
      (nextTask && nextTask.tabIndex >= 0 ? nextTask : null) ??
      (previousTask && previousTask.tabIndex >= 0 ? previousTask : null) ??
      (item?.parentElement as HTMLElement | null);
    setIsRemoving(true);
    try {
      const result = await removeTask(id);
      if (result.success) {
        shouldFocusDeleteAfterCancel.current = false;
        setIsConfirming(false);
        window.setTimeout(() => focusTarget?.focus(), 0);
      }
    } finally {
      setIsRemoving(false);
    }
  };

  return (
    <div className="flex flex-col items-end gap-1" data-task-click-ignore>
      {isConfirming ? (
        <>
          <p className="text-base-content/70 text-xs" role="status">
            This task has {subtaskCount} subtasks. Deleting it removes all of
            them.
          </p>
          <div className="flex flex-wrap justify-end gap-1">
            <Button
              type="button"
              size="xs"
              color="ghost"
              ref={cancelButtonRef}
              onClick={() => {
                shouldFocusDeleteAfterCancel.current = true;
                setIsConfirming(false);
              }}
              className="focus-visible:outline-primary min-h-11 focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              Cancel
            </Button>
            <Button
              ref={confirmButtonRef}
              type="button"
              size="xs"
              color="ghost"
              onClick={() => void handleRemove()}
              disabled={isRemoving}
              className="text-error focus-visible:outline-primary min-h-11 focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              Delete task and subtasks
            </Button>
          </div>
        </>
      ) : (
        <button
          ref={deleteButtonRef}
          type="button"
          data-task-click-ignore
          className={`error-button focus-visible:outline-primary min-h-11 cursor-pointer px-2 focus-visible:outline-2 focus-visible:outline-offset-2 ${isCompleted ? "text-error/50 line-through" : "text-error hover:underline"}`.trim()}
          onClick={() => {
            if (subtaskCount > 0) {
              shouldFocusDeleteAfterCancel.current = true;
              setIsConfirming(true);
            } else void handleRemove();
          }}
        >
          {isCompleted ? "Dismiss" : "Delete"}
        </button>
      )}
    </div>
  );
};

export default DeleteButton;
