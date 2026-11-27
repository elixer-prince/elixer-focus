import DeleteButton from "@/features/tasks/components/Task/DeleteButton";
import SubtaskChecklist from "@/features/tasks/components/Task/SubtaskChecklist";
import {
  useSubtaskCount,
  useToggleTaskCompletion,
  useUpdateTask,
} from "@/stores";
import { formatRelativeTime } from "@/utils/date";
import { useSortable } from "@dnd-kit/react/sortable";
import { useCallback, useEffect, useRef, useState } from "react";

const DOUBLE_CLICK_TIMEOUT = 300;
const TASK_EXIT_DURATION_MS = 200;

export type TaskCompletionTransition = {
  status?: "pending" | "exiting";
  onStart?: (id: string, completed: boolean, wasFocused: boolean) => void;
  onResult?: (
    id: string,
    completed: boolean,
    succeeded: boolean,
    wasFocused: boolean,
  ) => void;
  onExitAnimationEnd?: (id: string) => void;
};

interface TaskProps {
  index: number;
  id: string;
  title: string;
  category: string;
  description?: string;
  isCompleted: boolean;
  isSelected: boolean;
  updatedAt: number;
  isSortingDisabled?: boolean;
  taskSurface?: "matrix" | "home" | "archive";
  completionTransition?: TaskCompletionTransition;
}

const Task = ({
  index,
  id,
  title,
  category,
  description,
  isCompleted,
  isSelected,
  updatedAt,
  isSortingDisabled = false,
  taskSurface = "home",
  completionTransition,
}: TaskProps) => {
  const toggleTaskCompletion = useToggleTaskCompletion();
  const updateTask = useUpdateTask();
  const subtaskCount = useSubtaskCount(id);

  const [isEditing, setIsEditing] = useState(false);
  const titleRef = useRef(title);
  const descriptionRef = useRef(description);
  const [editTitle, setEditTitle] = useState(title);
  const [editDescription, setEditDescription] = useState(description || "");
  const titleInputRef = useRef<HTMLInputElement>(null);
  const lastClickTimeRef = useRef(0);
  const handleRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLLIElement>(null);
  const completionTransitionRef = useRef(completionTransition);
  completionTransitionRef.current = completionTransition;

  // Keep refs in sync with latest props on every render
  titleRef.current = title;
  descriptionRef.current = description;

  const { ref, isDragging } = useSortable({
    id,
    index,
    type: "task",
    accept: "task",
    group: category,
    disabled: isEditing || isSortingDisabled,
  });

  const handleCompletionChange = useCallback(async () => {
    const completed = !isCompleted;
    const wasFocused =
      wrapperRef.current?.contains(document.activeElement) ?? false;
    completionTransition?.onStart?.(id, completed, wasFocused);
    const result = await toggleTaskCompletion(id, completed);
    completionTransition?.onResult?.(
      id,
      completed,
      result?.success !== false,
      wasFocused,
    );
  }, [completionTransition, id, isCompleted, toggleTaskCompletion]);

  useEffect(() => {
    if (completionTransition?.status !== "exiting") return;

    const prefersReducedMotion =
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    const timeoutId = window.setTimeout(
      () => completionTransitionRef.current?.onExitAnimationEnd?.(id),
      prefersReducedMotion ? 0 : TASK_EXIT_DURATION_MS,
    );

    return () => window.clearTimeout(timeoutId);
  }, [completionTransition?.status, id]);

  const startEditing = useCallback(() => {
    setIsEditing(true);
    setEditTitle(titleRef.current);
    setEditDescription(descriptionRef.current || "");
  }, []);

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      // Don't trigger if clicking on checkbox, button, or drag handle
      if (
        e.target instanceof HTMLElement &&
        (e.target.tagName === "INPUT" || e.target.tagName === "BUTTON")
      ) {
        return;
      }
      if (
        e.target instanceof Element &&
        e.target.closest("[data-task-click-ignore]")
      ) {
        return;
      }
      if (
        handleRef.current &&
        (e.target === handleRef.current ||
          (e.target instanceof Node && handleRef.current.contains(e.target)))
      ) {
        return;
      }
      const now = Date.now();
      if (now - lastClickTimeRef.current < DOUBLE_CLICK_TIMEOUT) {
        startEditing();
        lastClickTimeRef.current = 0;
      } else {
        lastClickTimeRef.current = now;
      }
    },
    [startEditing],
  );

  const handleRowKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLLIElement>) => {
      if (e.target !== e.currentTarget || e.key !== "F2") return;
      e.preventDefault();
      startEditing();
    },
    [startEditing],
  );

  useEffect(() => {
    if (isEditing && titleInputRef.current) {
      titleInputRef.current.focus();
    }
  }, [isEditing]);

  const saveEdit = useCallback(async () => {
    const trimmedTitle = editTitle.trim();
    if (!trimmedTitle) {
      return;
    }
    const result = await updateTask(id, {
      title: trimmedTitle,
      description: editDescription.trim() || undefined,
    });
    if (result?.success !== false) setIsEditing(false);
  }, [editTitle, editDescription, id, updateTask]);

  const cancelEdit = useCallback(() => {
    setEditTitle(titleRef.current);
    setEditDescription(descriptionRef.current || "");
    setIsEditing(false);
  }, []);

  // Stable ref for cancelEdit so the global listeners can access it
  const cancelEditRef = useRef(cancelEdit);
  cancelEditRef.current = cancelEdit;

  // Global listeners for Escape key and click-outside during editing
  useEffect(() => {
    if (!isEditing) return;

    // Escape key listener on window capture phase
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        cancelEditRef.current();
      }
    };

    // Click-outside listener: cancel when clicking outside the task element
    const handleMouseDown = (e: MouseEvent) => {
      if (
        wrapperRef.current &&
        e.target instanceof Node &&
        !wrapperRef.current.contains(e.target)
      ) {
        cancelEditRef.current();
      }
    };

    window.addEventListener("keydown", handleKeyDown, true);
    document.addEventListener("mousedown", handleMouseDown, true);

    return () => {
      window.removeEventListener("keydown", handleKeyDown, true);
      document.removeEventListener("mousedown", handleMouseDown, true);
    };
  }, [isEditing]);

  // Title input: handle Enter to save
  const handleTitleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        void saveEdit();
      }
    },
    [saveEdit],
  );

  if (isEditing) {
    return (
      <li
        ref={(node) => {
          (
            ref as unknown as React.MutableRefObject<HTMLLIElement | null>
          ).current = node;
          wrapperRef.current = node;
        }}
        data-task-id={id}
        data-task-surface={taskSurface}
        className={`task bg-base-100 border-primary focus-visible:outline-primary mr-3 flex flex-col gap-2 rounded-md border px-3 py-2 transition-[transform,opacity] duration-200 ease-in-out focus-visible:outline-2 focus-visible:outline-offset-2 motion-reduce:transition-none ${completionTransition?.status === "exiting" ? "translate-x-8 opacity-0" : ""} ${index === 0 ? "outline-primary outline" : ""} ${isSelected ? "border-primary" : "border-base-content/25"}`.trim()}
      >
        <div className="flex items-center gap-2">
          <input
            className="accent-primary-content/25"
            type="checkbox"
            checked={isCompleted}
            onChange={handleCompletionChange}
            aria-label={`${isCompleted ? "Reopen" : "Complete"} ${title}`}
            disabled={completionTransition?.status === "pending"}
          />
          <input
            ref={titleInputRef}
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            onKeyDown={handleTitleKeyDown}
            aria-label="Task title"
            className="focus-visible:outline-primary flex-1 bg-transparent outline-none focus-visible:outline-2 focus-visible:outline-offset-2"
          />
        </div>
        <div className="flex items-start gap-2">
          <div className="w-5" />
          <textarea
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
            placeholder="Description (optional)"
            aria-label="Task description"
            className="focus-visible:outline-primary flex-1 resize-none bg-transparent text-sm outline-none focus-visible:outline-2 focus-visible:outline-offset-2"
            rows={2}
          />
        </div>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => cancelEditRef.current()}
            className="btn btn-ghost btn-xs"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={saveEdit}
            className="btn btn-primary btn-xs"
          >
            Save
          </button>
        </div>
      </li>
    );
  }

  return (
    <li
      ref={(node) => {
        (
          ref as unknown as React.MutableRefObject<HTMLLIElement | null>
        ).current = node;
        wrapperRef.current = node;
      }}
      tabIndex={0}
      data-dragging={isDragging}
      data-task-id={id}
      data-task-surface={taskSurface}
      aria-keyshortcuts="F2"
      onClick={handleClick}
      onKeyDown={handleRowKeyDown}
      className={`task bg-base-100 focus-visible:outline-primary mr-3 flex flex-col gap-2 rounded-md border px-3 py-2 transition-[transform,opacity] duration-200 ease-in-out focus-visible:outline-2 focus-visible:outline-offset-2 motion-reduce:transition-none ${completionTransition?.status === "exiting" ? "translate-x-8 opacity-0" : ""} ${index === 0 ? "outline-primary outline" : ""} ${isSelected ? "border-primary" : "border-base-content/25"}`.trim()}
    >
      <div className="flex items-center justify-between gap-1">
        <div className="flex min-w-0 items-center gap-2">
          <div
            ref={handleRef}
            className="cursor-grab"
            aria-label="Drag to reorder"
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="currentColor"
              className="opacity-40"
            >
              <circle cx="3" cy="2" r="1" />
              <circle cx="9" cy="2" r="1" />
              <circle cx="3" cy="6" r="1" />
              <circle cx="9" cy="6" r="1" />
              <circle cx="3" cy="10" r="1" />
              <circle cx="9" cy="10" r="1" />
            </svg>
          </div>

          <input
            className="accent-primary-content/25"
            type="checkbox"
            checked={isCompleted}
            onChange={handleCompletionChange}
            aria-label={`${isCompleted ? "Reopen" : "Complete"} ${title}`}
            disabled={completionTransition?.status === "pending"}
          />

          <p
            className={`${taskSurface === "matrix" ? "min-w-0 truncate" : taskSurface === "archive" ? "min-w-0 break-words" : ""} ${isCompleted ? "text-base-content/50 line-through" : ""}`.trim()}
          >
            {title}
          </p>

          {description && (
            <p
              className={
                taskSurface === "matrix"
                  ? "truncate text-sm opacity-70"
                  : taskSurface === "archive"
                    ? "min-w-0 text-sm break-words opacity-70"
                    : "text-sm opacity-70"
              }
            >
              {description}
            </p>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <span
            className="text-xs opacity-40"
            title={new Date(updatedAt).toLocaleString()}
          >
            {formatRelativeTime(updatedAt)}
          </span>
          <DeleteButton
            id={id}
            isCompleted={isCompleted}
            subtaskCount={subtaskCount}
          />
        </div>
      </div>

      {taskSurface !== "home" && (
        <SubtaskChecklist taskId={id} taskTitle={title} />
      )}
    </li>
  );
};

export default Task;
