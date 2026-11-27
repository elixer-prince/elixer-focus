import { Button, Input } from "@/components/ui";
import type { Subtask } from "@/features/tasks/types/subtask";
import { getSubtaskDescendantIds } from "@/features/tasks/utils/subtask-tree";
import {
  useAddSubtask,
  useRemoveSubtask,
  useSubtaskCoordinatorSupport,
  useSubtasks,
  useToggleSubtaskCompletion,
  useUpdateSubtask,
} from "@/stores";
import { useSortable } from "@dnd-kit/react/sortable";
import { useEffect, useId, useMemo, useRef, useState } from "react";

type SubtaskActions = {
  add: (
    taskId: string,
    parentSubtaskId: string | null,
    title: string,
  ) => Promise<{ success: boolean }>;
  update: (subtaskId: string, title: string) => Promise<{ success: boolean }>;
  toggle: (
    subtaskId: string,
    completed: boolean,
  ) => Promise<{ success: boolean }>;
  remove: (subtaskId: string) => Promise<{ success: boolean }>;
};

type SubtaskComposerProps = {
  taskId: string;
  taskTitle: string;
  parentSubtaskId: string | null;
  parentTitle: string;
  supported: boolean;
  add: SubtaskActions["add"];
};

const SubtaskComposer = ({
  taskId,
  taskTitle,
  parentSubtaskId,
  parentTitle,
  supported,
  add,
}: SubtaskComposerProps) => {
  const [draft, setDraft] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const inputId = useId();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const title = draft.trim();
    if (!title || !supported || isSaving) return;

    setIsSaving(true);
    try {
      const result = await add(taskId, parentSubtaskId, title);
      if (result.success) setDraft("");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <li className="list-none">
      <form className="flex items-center gap-2" onSubmit={handleSubmit}>
        <label className="sr-only" htmlFor={inputId}>
          Add a subtask to {parentTitle} in {taskTitle}
        </label>
        <div className="min-w-0 flex-1">
          <Input
            id={inputId}
            name={`subtask-${taskId}-${parentSubtaskId ?? "root"}`}
            type="text"
            inputSize="sm"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Escape") setDraft("");
            }}
            placeholder="Add a subtask…"
            autoComplete="off"
            disabled={!supported || isSaving}
            className="bg-base-100 focus-visible:outline-primary min-h-11 focus-visible:outline-2 focus-visible:outline-offset-2"
          />
        </div>
        <Button
          type="submit"
          size="sm"
          color="ghost"
          disabled={!supported || isSaving || !draft.trim()}
          className="focus-visible:outline-primary min-h-11 focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          Add
        </Button>
      </form>
    </li>
  );
};

type SubtaskNodeProps = {
  subtask: Subtask;
  index: number;
  taskTitle: string;
  allSubtasks: Subtask[];
  childrenByParent: Map<string | null, Subtask[]>;
  supported: boolean;
  actions: SubtaskActions;
  onRemoveSuccess: () => void;
};

const SubtaskNode = ({
  subtask,
  index,
  taskTitle,
  allSubtasks,
  childrenByParent,
  supported,
  actions,
  onRemoveSuccess,
}: SubtaskNodeProps) => {
  const children = childrenByParent.get(subtask.id) ?? [];
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [deleteDescendantCount, setDeleteDescendantCount] = useState(0);
  const [draft, setDraft] = useState(subtask.title);
  const [hasTitleError, setHasTitleError] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const editorRef = useRef<HTMLDivElement>(null);
  const disclosureRef = useRef<HTMLButtonElement>(null);
  const titleButtonRef = useRef<HTMLButtonElement>(null);
  const deleteButtonRef = useRef<HTMLButtonElement>(null);
  const cancelDeleteButtonRef = useRef<HTMLButtonElement>(null);
  const shouldFocusTitleAfterEdit = useRef(false);
  const shouldFocusDeleteAfterCancel = useRef(false);
  const listId = useId();
  const inputId = useId();
  const siblingGroup = `subtasks:${subtask.taskId}:${subtask.parentSubtaskId ?? "root"}`;

  const { ref, isDragging } = useSortable({
    id: `subtask-${subtask.id}`,
    index,
    type: "subtask",
    accept: "subtask",
    group: siblingGroup,
    disabled: !supported || isEditing || isConfirmingDelete,
  });

  useEffect(() => {
    if (!isEditing) return;
    inputRef.current?.focus();

    const cancelOutsideEdit = (event: MouseEvent) => {
      if (
        event.target instanceof Node &&
        !editorRef.current?.contains(event.target)
      ) {
        setDraft(subtask.title);
        setHasTitleError(false);
        setIsEditing(false);
      }
    };

    document.addEventListener("mousedown", cancelOutsideEdit);
    return () => document.removeEventListener("mousedown", cancelOutsideEdit);
  }, [isEditing, subtask.title]);

  useEffect(() => {
    if (!isEditing && shouldFocusTitleAfterEdit.current) {
      titleButtonRef.current?.focus();
      shouldFocusTitleAfterEdit.current = false;
    }
  }, [isEditing]);

  useEffect(() => {
    if (isConfirmingDelete) {
      cancelDeleteButtonRef.current?.focus();
    } else if (shouldFocusDeleteAfterCancel.current) {
      deleteButtonRef.current?.focus();
      shouldFocusDeleteAfterCancel.current = false;
    }
  }, [isConfirmingDelete]);

  const startEditing = () => {
    setDraft(subtask.title);
    setHasTitleError(false);
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setDraft(subtask.title);
    setHasTitleError(false);
    shouldFocusTitleAfterEdit.current = true;
    setIsEditing(false);
  };

  const saveEditing = async () => {
    const title = draft.trim();
    if (!title) {
      setHasTitleError(true);
      return;
    }
    const result = await actions.update(subtask.id, title);
    if (result.success) {
      shouldFocusTitleAfterEdit.current = true;
      setIsEditing(false);
    }
  };

  const remove = async () => {
    const result = await actions.remove(subtask.id);
    if (result.success) {
      shouldFocusDeleteAfterCancel.current = false;
      setIsConfirmingDelete(false);
      onRemoveSuccess();
    }
  };

  const cancelDelete = () => {
    shouldFocusDeleteAfterCancel.current = true;
    setIsConfirmingDelete(false);
  };

  const completedChildren = children.filter(
    (child) => child.isCompleted,
  ).length;
  const subtaskCountLabel = `${completedChildren} of ${children.length} subtasks complete`;

  return (
    <li
      ref={ref}
      tabIndex={0}
      aria-roledescription="sortable"
      data-dragging={isDragging}
      className={`border-base-content/15 bg-base-100/70 focus-visible:outline-primary flex list-none flex-col gap-2 rounded-md border p-2 focus-visible:outline-2 focus-visible:outline-offset-2 ${isDragging ? "opacity-60" : ""}`.trim()}
    >
      <div className="flex min-w-0 items-center gap-2">
        <Button
          type="button"
          size="sm"
          color="ghost"
          aria-label={`Drag to reorder ${subtask.title}`}
          tabIndex={-1}
          className="min-h-11 min-w-11 cursor-grab select-none active:cursor-grabbing"
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="currentColor"
            aria-hidden="true"
          >
            <circle cx="3" cy="2" r="1" />
            <circle cx="9" cy="2" r="1" />
            <circle cx="3" cy="6" r="1" />
            <circle cx="9" cy="6" r="1" />
            <circle cx="3" cy="10" r="1" />
            <circle cx="9" cy="10" r="1" />
          </svg>
        </Button>
        <label
          className="flex min-h-11 min-w-11 cursor-pointer items-center justify-center"
          onClick={(event) => event.stopPropagation()}
        >
          <input
            type="checkbox"
            checked={subtask.isCompleted}
            disabled={!supported}
            aria-label={`Mark ${subtask.title} ${subtask.isCompleted ? "incomplete" : "complete"}`}
            onChange={(event) =>
              void actions.toggle(subtask.id, event.target.checked)
            }
            className="checkbox checkbox-sm accent-primary-content/25 focus-visible:outline-primary focus-visible:outline-2 focus-visible:outline-offset-2"
          />
        </label>

        {isEditing ? (
          <div
            ref={editorRef}
            className="flex min-w-0 flex-1 items-center gap-2"
          >
            <label className="sr-only" htmlFor={inputId}>
              Subtask title
            </label>
            <div className="min-w-0 flex-1">
              <Input
                ref={inputRef}
                id={inputId}
                name={`subtask-title-${subtask.id}`}
                type="text"
                inputSize="sm"
                value={draft}
                autoComplete="off"
                error={hasTitleError}
                aria-describedby={
                  hasTitleError ? `${inputId}-error` : undefined
                }
                disabled={!supported}
                onChange={(event) => {
                  setDraft(event.target.value);
                  setHasTitleError(false);
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    void saveEditing();
                  }
                  if (event.key === "Escape") {
                    event.preventDefault();
                    cancelEditing();
                  }
                }}
                className="bg-base-100 focus-visible:outline-primary min-h-11 focus-visible:outline-2 focus-visible:outline-offset-2"
              />
            </div>
            <Button
              type="button"
              size="xs"
              color="primary"
              onClick={() => void saveEditing()}
              disabled={!supported}
              className="focus-visible:outline-primary min-h-11 focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              Save
            </Button>
            <Button
              type="button"
              size="xs"
              color="ghost"
              onClick={cancelEditing}
              className="focus-visible:outline-primary min-h-11 focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              Cancel
            </Button>
          </div>
        ) : (
          <Button
            ref={titleButtonRef}
            type="button"
            size="sm"
            color="ghost"
            onClick={startEditing}
            onDoubleClick={startEditing}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                startEditing();
              }
            }}
            disabled={!supported}
            className={`focus-visible:outline-primary min-h-11 min-w-0 flex-1 justify-start truncate text-left focus-visible:outline-2 focus-visible:outline-offset-2 ${subtask.isCompleted ? "text-base-content line-through" : ""}`.trim()}
            title="Edit subtask"
          >
            {subtask.title}
          </Button>
        )}

        {children.length > 0 && (
          <Button
            ref={disclosureRef}
            type="button"
            size="xs"
            color="ghost"
            aria-expanded={isExpanded}
            aria-controls={isExpanded ? listId : undefined}
            aria-label={`${isExpanded ? "Collapse" : "Expand"} subtasks for ${subtask.title}, ${subtaskCountLabel}`}
            onClick={() => setIsExpanded((expanded) => !expanded)}
            className="focus-visible:outline-primary min-h-11 min-w-11 shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            {completedChildren}/{children.length}
          </Button>
        )}
        {children.length === 0 && (
          <Button
            ref={disclosureRef}
            type="button"
            size="xs"
            color="ghost"
            aria-expanded={isExpanded}
            aria-controls={isExpanded ? listId : undefined}
            aria-label={`${isExpanded ? "Hide" : "Add"} subtasks for ${subtask.title}`}
            onClick={() => setIsExpanded((expanded) => !expanded)}
            className="focus-visible:outline-primary min-h-11 min-w-11 shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            {isExpanded ? "Close" : "Add step"}
          </Button>
        )}
        {isConfirmingDelete ? (
          <span
            className="flex shrink-0 items-center gap-1"
            role="group"
            aria-label={`Confirm deleting ${subtask.title}`}
          >
            <Button
              ref={cancelDeleteButtonRef}
              type="button"
              size="xs"
              color="ghost"
              onClick={cancelDelete}
              className="focus-visible:outline-primary min-h-11 focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="xs"
              color="ghost"
              onClick={() => void remove()}
              disabled={!supported}
              className="focus-visible:outline-primary text-error min-h-11 focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              Remove {deleteDescendantCount} nested items
            </Button>
          </span>
        ) : (
          <Button
            ref={deleteButtonRef}
            type="button"
            size="xs"
            color="ghost"
            onClick={() => {
              if (children.length > 0) {
                setDeleteDescendantCount(
                  getSubtaskDescendantIds(allSubtasks, subtask.id).size,
                );
                shouldFocusDeleteAfterCancel.current = true;
                setIsConfirmingDelete(true);
              } else void remove();
            }}
            disabled={!supported}
            aria-label={`Delete subtask ${subtask.title}${children.length > 0 ? " and its descendants" : ""}`}
            className="text-error focus-visible:outline-primary min-h-11 shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            Delete
          </Button>
        )}
      </div>

      {hasTitleError && (
        <p id={`${inputId}-error`} className="text-error text-xs" role="alert">
          A subtask title cannot be empty.
        </p>
      )}

      {isConfirmingDelete && children.length > 0 && (
        <p className="text-base-content/70 text-xs" role="status">
          This also removes {deleteDescendantCount} nested subtask
          {deleteDescendantCount === 1 ? "" : "s"}.
        </p>
      )}

      {isExpanded && (
        <ul
          id={listId}
          className="border-base-content/15 ml-2 flex list-none flex-col gap-2 border-l pl-3"
        >
          {children.map((child, childIndex) => (
            <SubtaskNode
              key={child.id}
              subtask={child}
              index={childIndex}
              taskTitle={taskTitle}
              allSubtasks={allSubtasks}
              childrenByParent={childrenByParent}
              supported={supported}
              actions={actions}
              onRemoveSuccess={() => disclosureRef.current?.focus()}
            />
          ))}
          <SubtaskComposer
            taskId={subtask.taskId}
            taskTitle={taskTitle}
            parentSubtaskId={subtask.id}
            parentTitle={subtask.title}
            supported={supported}
            add={actions.add}
          />
        </ul>
      )}
    </li>
  );
};

type SubtaskChecklistProps = {
  taskId: string;
  taskTitle: string;
};

const SubtaskChecklist = ({ taskId, taskTitle }: SubtaskChecklistProps) => {
  const subtasks = useSubtasks();
  const coordinatorSupport = useSubtaskCoordinatorSupport();
  const supported = coordinatorSupport === true;
  const add = useAddSubtask();
  const update = useUpdateSubtask();
  const toggle = useToggleSubtaskCompletion();
  const remove = useRemoveSubtask();
  const [isExpanded, setIsExpanded] = useState(false);
  const disclosureRef = useRef<HTMLButtonElement>(null);
  const listId = useId();

  const childrenByParent = useMemo(() => {
    const grouped = new Map<string | null, Subtask[]>();
    for (const subtask of subtasks) {
      if (subtask.taskId !== taskId) continue;
      const siblings = grouped.get(subtask.parentSubtaskId) ?? [];
      siblings.push(subtask);
      grouped.set(subtask.parentSubtaskId, siblings);
    }
    grouped.forEach((siblings) =>
      siblings.sort((left, right) => left.position - right.position),
    );
    return grouped;
  }, [subtasks, taskId]);

  const children = childrenByParent.get(null) ?? [];
  const completedChildren = children.filter(
    (child) => child.isCompleted,
  ).length;
  const actions: SubtaskActions = { add, update, toggle, remove };

  return (
    <section
      className="border-base-content/15 mt-2 border-t pt-2"
      aria-label={`Subtasks for ${taskTitle}`}
      data-task-click-ignore
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Button
          ref={disclosureRef}
          type="button"
          size="xs"
          color="ghost"
          aria-expanded={isExpanded}
          aria-controls={isExpanded ? listId : undefined}
          aria-label={`${isExpanded ? "Collapse" : "Expand"} subtasks for ${taskTitle}${children.length > 0 ? `, ${completedChildren} of ${children.length} complete` : ""}`}
          onClick={() => setIsExpanded((expanded) => !expanded)}
          className="focus-visible:outline-primary min-h-11 min-w-11 focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          {children.length > 0
            ? `${completedChildren}/${children.length} subtasks`
            : isExpanded
              ? "Close checklist"
              : "Add first subtask"}
        </Button>
        {coordinatorSupport !== true && (
          <p className="text-warning text-xs" role="status">
            {coordinatorSupport === false
              ? "Refresh the older tab to enable subtask changes."
              : "Waiting for a tab to confirm Subtask support."}
          </p>
        )}
      </div>

      {isExpanded && (
        <ul
          id={listId}
          className="border-base-content/20 mt-2 flex list-none flex-col gap-2 border-l pl-3"
        >
          {children.map((subtask, index) => (
            <SubtaskNode
              key={subtask.id}
              subtask={subtask}
              index={index}
              taskTitle={taskTitle}
              allSubtasks={subtasks}
              childrenByParent={childrenByParent}
              supported={supported}
              actions={actions}
              onRemoveSuccess={() => disclosureRef.current?.focus()}
            />
          ))}
          <SubtaskComposer
            taskId={taskId}
            taskTitle={taskTitle}
            parentSubtaskId={null}
            parentTitle={taskTitle}
            supported={supported}
            add={add}
          />
        </ul>
      )}
    </section>
  );
};

export default SubtaskChecklist;
