import Task, {
  type TaskCompletionTransition,
} from "@/features/tasks/components/Task/Index";
import {
  TASK_CATEGORY_LABELS,
  TASK_CATEGORY_ORDER,
  type CompletedTaskGroup,
} from "@/features/tasks/utils/task-archive";
import type {
  Task as TaskData,
  TaskCategory,
} from "@/features/tasks/types/task";
import { useCallback, useRef, useState, type Ref } from "react";

type PendingReopen = {
  task: TaskData;
  category: TaskCategory;
  index: number;
  wasFocused: boolean;
};

interface TaskArchiveProps {
  groups: CompletedTaskGroup[];
  hiddenTaskIds?: ReadonlySet<string>;
  buttonRef?: Ref<HTMLButtonElement>;
  onTaskReopened?: (id: string, wasFocused: boolean) => void;
}

const TaskArchive = ({
  groups,
  hiddenTaskIds = new Set(),
  buttonRef,
  onTaskReopened,
}: TaskArchiveProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [pendingReopens, setPendingReopens] = useState<
    Map<string, PendingReopen>
  >(() => new Map());
  const pendingReopensRef = useRef(pendingReopens);
  pendingReopensRef.current = pendingReopens;

  const handleCompletionStart = useCallback(
    (id: string, completed: boolean, wasFocused: boolean) => {
      if (completed) return;
      const group = groups.find((item) =>
        item.tasks.some((task) => task.id === id),
      );
      const task = group?.tasks.find((item) => item.id === id);
      if (!group || !task) return;
      const next = new Map(pendingReopensRef.current);
      next.set(id, {
        task,
        category: group.category,
        index: group.tasks.findIndex((item) => item.id === id),
        wasFocused,
      });
      pendingReopensRef.current = next;
      setPendingReopens(next);
    },
    [groups],
  );

  const handleCompletionResult = useCallback(
    (id: string, completed: boolean, succeeded: boolean) => {
      if (completed) return;
      if (succeeded) {
        const pending = pendingReopensRef.current.get(id);
        if (pending) onTaskReopened?.(id, pending.wasFocused);
      }
      const next = new Map(pendingReopensRef.current);
      next.delete(id);
      pendingReopensRef.current = next;
      setPendingReopens(next);
    },
    [onTaskReopened],
  );

  const taskGroups = TASK_CATEGORY_ORDER.flatMap((category) => {
    const group = groups.find((item) => item.category === category);
    const tasks = [...(group?.tasks ?? [])];
    for (const [id, pending] of pendingReopens) {
      if (
        pending.category !== category ||
        tasks.some((task) => task.id === id)
      ) {
        continue;
      }
      tasks.splice(Math.min(pending.index, tasks.length), 0, pending.task);
    }
    const visibleTasks = tasks.filter((task) => !hiddenTaskIds.has(task.id));
    return visibleTasks.length > 0 ? [{ category, tasks: visibleTasks }] : [];
  });
  const completedCount =
    groups.reduce((count, group) => count + group.tasks.length, 0) +
    [...pendingReopens.keys()].filter(
      (id) =>
        !groups.some((group) => group.tasks.some((task) => task.id === id)),
    ).length;

  if (completedCount === 0) return null;

  return (
    <section
      className="task-panel mx-auto mt-8 w-full max-w-4xl"
      aria-labelledby="completed-task-archive-heading"
    >
      <h2
        id="completed-task-archive-heading"
        className="text-base-content text-lg font-semibold"
      >
        <button
          ref={buttonRef}
          type="button"
          className="btn btn-ghost border-base-content/25 flex h-auto w-full items-center justify-between rounded-md border px-4 py-3 text-left"
          aria-expanded={isExpanded}
          aria-controls="completed-task-archive"
          onClick={() => setIsExpanded((expanded) => !expanded)}
        >
          <span>Completed Tasks</span>
          <span className="text-base-content/70 flex items-center gap-2 text-sm font-normal">
            <span>{completedCount}</span>
            <svg
              aria-hidden="true"
              viewBox="0 0 16 16"
              className={`size-4 transition-transform duration-200 motion-reduce:transition-none ${isExpanded ? "rotate-180" : ""}`.trim()}
              fill="none"
            >
              <path
                d="m3 6 5 5 5-5"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
              />
            </svg>
          </span>
        </button>
      </h2>

      <div id="completed-task-archive" hidden={!isExpanded}>
        {isExpanded &&
          taskGroups.map(({ category, tasks }) => (
            <section key={category} className="mt-6">
              <h3 className="mb-3 text-base font-semibold">
                {TASK_CATEGORY_LABELS[category]}
              </h3>
              <ul
                className="flex flex-col gap-4"
                aria-label={`${TASK_CATEGORY_LABELS[category]} completed tasks`}
              >
                {tasks.map((task, index) => {
                  const isPending = pendingReopens.has(task.id);
                  const completionTransition: TaskCompletionTransition = {
                    ...(isPending ? { status: "pending" as const } : {}),
                    onStart: handleCompletionStart,
                    onResult: handleCompletionResult,
                  };

                  return (
                    <Task
                      key={task.id}
                      id={task.id}
                      title={task.title}
                      category={task.category}
                      description={task.description}
                      isCompleted={task.isCompleted}
                      isSelected={task.isSelected}
                      updatedAt={task.updatedAt}
                      index={index}
                      isSortingDisabled
                      taskSurface="archive"
                      completionTransition={completionTransition}
                    />
                  );
                })}
              </ul>
            </section>
          ))}
      </div>
    </section>
  );
};

export default TaskArchive;
