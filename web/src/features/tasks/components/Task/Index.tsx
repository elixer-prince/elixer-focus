import DeleteButton from "@/features/tasks/components/Task/DeleteButton";
import { useToggleTaskCompletion, useUpdateTask } from "@/stores";
import { formatRelativeTime } from "@/utils/date";
import { useSortable } from "@dnd-kit/react/sortable";
import { useCallback, useEffect, useRef, useState } from "react";

const DOUBLE_CLICK_TIMEOUT = 300;

interface TaskProps {
  index: number;
  id: string;
  title: string;
  category: string;
  description?: string;
  isCompleted: boolean;
  isSelected: boolean;
  updatedAt: number;
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
}: TaskProps) => {
  const toggleTaskCompletion = useToggleTaskCompletion();
  const updateTask = useUpdateTask();

  const [isEditing, setIsEditing] = useState(false);
  const titleRef = useRef(title);
  const descriptionRef = useRef(description);
  const [editTitle, setEditTitle] = useState(title);
  const [editDescription, setEditDescription] = useState(description || "");
  const titleInputRef = useRef<HTMLInputElement>(null);
  const lastClickTimeRef = useRef(0);
  const handleRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLLIElement>(null);

  // Keep refs in sync with latest props on every render
  titleRef.current = title;
  descriptionRef.current = description;

  const { ref, isDragging } = useSortable({
    id,
    index,
    type: "task",
    accept: "task",
    group: category,
    disabled: isEditing,
  });

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
        className={`task bg-base-100 border-primary mr-3 flex flex-col gap-2 rounded-md border px-3 py-2 ${index === 0 ? "outline-primary outline" : ""} ${isSelected ? "border-primary" : "border-base-content/25"}`.trim()}
      >
        <div className="flex items-center gap-2">
          <input
            className="accent-primary-content/25"
            type="checkbox"
            checked={isCompleted}
            onChange={() => toggleTaskCompletion(id, !isCompleted)}
          />
          <input
            ref={titleInputRef}
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            onKeyDown={handleTitleKeyDown}
            aria-label="Task title"
            className="flex-1 bg-transparent outline-none"
          />
        </div>
        <div className="flex items-start gap-2">
          <div className="w-5" />
          <textarea
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
            placeholder="Description (optional)"
            aria-label="Task description"
            className="flex-1 resize-none bg-transparent text-sm outline-none"
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
      ref={ref}
      tabIndex={0}
      data-dragging={isDragging}
      onClick={handleClick}
      className={`task bg-base-100 mr-3 flex items-center justify-between gap-1 rounded-md border px-3 py-2 ${index === 0 ? "outline-primary outline" : ""} ${isSelected ? "border-primary" : "border-base-content/25"}`.trim()}
    >
      <div className="flex items-center gap-2">
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
          onChange={() => toggleTaskCompletion(id, !isCompleted)}
        />

        <p className={isCompleted ? "text-base-content/50 line-through" : ""}>
          {title}
        </p>

        {description && <p className="text-sm opacity-70">{description}</p>}
      </div>

      <div className="flex items-center gap-2">
        <span
          className="text-xs opacity-40"
          title={new Date(updatedAt).toLocaleString()}
        >
          {formatRelativeTime(updatedAt)}
        </span>
        <DeleteButton id={id} isCompleted={isCompleted} />
      </div>
    </li>
  );
};

export default Task;
