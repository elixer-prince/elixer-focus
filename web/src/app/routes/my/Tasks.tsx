import { useTimerRunning } from "@/features/countdown-timer/stores/countdown-store";
import Column from "@/features/tasks/components/Column/Index";
import TaskPageHeader from "@/features/tasks/components/TaskPageHeader";
import TaskArchive from "@/features/tasks/components/TaskArchive";
import {
  useReorderSubtasks,
  useReorderTasks,
  useTasks,
  useTasksStore,
} from "@/stores";
import type { Task, TaskCategory } from "@/features/tasks/types/task";
import {
  getActiveTasks,
  getCompletedTaskGroups,
  mergeActiveTaskOrder,
  TASK_CATEGORY_ORDER,
} from "@/features/tasks/utils/task-archive";
import { filterTasksByQuery } from "@/features/tasks/utils/task-search";
import {
  sortTasksByDueAt,
  type TaskSortMode,
} from "@/features/tasks/utils/task-due-date";
import { move } from "@dnd-kit/helpers";
import { DragDropProvider, PointerSensor } from "@dnd-kit/react";
import { isSortable } from "@dnd-kit/react/sortable";
import {
  KeyboardSensor,
  PointerActivationConstraints,
  type DragEndEvent,
  type DragOverEvent,
} from "@dnd-kit/dom";
import { useSearchParams } from "react-router";
import usePageTitle from "@/hooks/usePageTitle";
import { useCallback, useRef, useState } from "react";

type GroupedTasks = Record<TaskCategory, Task[]>;

const CATEGORIES = TASK_CATEGORY_ORDER;

function groupByCategory(tasks: Task[]): GroupedTasks {
  const grouped: GroupedTasks = {
    "urgent-important": [],
    "not-urgent-important": [],
    "urgent-not-important": [],
    "not-urgent-not-important": [],
    uncategorised: [],
  };
  for (const task of tasks) {
    grouped[task.category].push(task);
  }
  return grouped;
}

function flattenTasks(grouped: GroupedTasks): Task[] {
  return CATEGORIES.flatMap((cat) => grouped[cat]);
}

const TasksRoute = () => {
  const { updatePageTitle } = usePageTitle();
  const timerRunning = useTimerRunning();
  const tasks = useTasks();
  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = searchParams.get("taskSearch") ?? "";
  const taskFocusScopeRef = useRef<HTMLDivElement>(null);
  const archiveDisclosureRef = useRef<HTMLButtonElement>(null);
  const [exitingTaskIds, setExitingTaskIds] = useState<Set<string>>(
    () => new Set(),
  );
  const [sortMode, setSortMode] = useState<TaskSortMode>("manual");

  if (!timerRunning) updatePageTitle("Elixer Focus - Tasks");

  const [previewTasks, setPreviewTasks] = useState<Task[] | null>(null);
  const previewTasksRef = useRef<Task[] | null>(null);
  const updatePreviewTasks = useCallback((nextTasks: Task[] | null) => {
    previewTasksRef.current = nextTasks;
    setPreviewTasks(nextTasks);
  }, []);
  const reorderTasks = useReorderTasks();
  const reorderSubtasks = useReorderSubtasks();
  const [isDragging, setIsDragging] = useState(false);
  const isSearchActive = searchQuery.trim().length > 0;
  const filteredTasks = filterTasksByQuery(
    getActiveTasks(previewTasks ?? tasks),
    searchQuery,
  );
  const visibleTasks =
    sortMode === "due-date" ? sortTasksByDueAt(filteredTasks) : filteredTasks;
  const completedTaskGroups = getCompletedTaskGroups(tasks);

  const handleTaskExitStart = useCallback((id: string) => {
    setExitingTaskIds((current) => new Set(current).add(id));
  }, []);

  const handleTaskExitEnd = useCallback((id: string, wasFocused: boolean) => {
    setExitingTaskIds((current) => {
      const next = new Set(current);
      next.delete(id);
      return next;
    });
    if (!wasFocused) return;

    const taskRows = Array.from(
      taskFocusScopeRef.current?.querySelectorAll<HTMLLIElement>(
        'li[data-task-surface="matrix"]',
      ) ?? [],
    );
    const currentIndex = taskRows.findIndex(
      (task) => task.dataset.taskId === id,
    );
    const nextTask = taskRows
      .slice(currentIndex + 1)
      .find((task) => task.dataset.taskId !== id);
    if (nextTask) {
      nextTask.focus();
    } else {
      archiveDisclosureRef.current?.focus();
    }
  }, []);

  const handleTaskReopened = useCallback((id: string, wasFocused: boolean) => {
    if (!wasFocused) return;
    window.requestAnimationFrame(() => {
      const taskRows = Array.from(
        taskFocusScopeRef.current?.querySelectorAll<HTMLLIElement>(
          'li[data-task-surface="matrix"]',
        ) ?? [],
      );
      const reopenedTask = taskRows.find((task) => task.dataset.taskId === id);
      const nextTask = reopenedTask ?? taskRows[0];
      if (nextTask) nextTask.focus();
      else {
        taskFocusScopeRef.current
          ?.querySelector<HTMLInputElement>('input[type="search"]')
          ?.focus();
      }
    });
  }, []);

  const handleSearchChange = useCallback(
    (query: string) => {
      const nextSearchParams = new URLSearchParams(searchParams);
      if (query) {
        nextSearchParams.set("taskSearch", query);
      } else {
        nextSearchParams.delete("taskSearch");
      }
      setSearchParams(nextSearchParams, { replace: true });
    },
    [searchParams, setSearchParams],
  );

  const handleDragStart = useCallback(() => {
    updatePreviewTasks(
      useTasksStore.getState().tasks.map((task) => ({ ...task })),
    );
    setIsDragging(true);
  }, [updatePreviewTasks]);

  const handleDragOver = useCallback(
    (event: Parameters<DragOverEvent>[0]) => {
      try {
        const { source, target } = event.operation;
        if (!isSortable(source) || source.type === "subtask") return;
        if (target && isSortable(target) && target.type === "subtask") return;

        const currentTasks =
          previewTasksRef.current ?? useTasksStore.getState().tasks;
        const grouped = groupByCategory(getActiveTasks(currentTasks));
        const moved = move(grouped, event);

        const result: GroupedTasks = {
          "urgent-important": [],
          "not-urgent-important": [],
          "urgent-not-important": [],
          "not-urgent-not-important": [],
          uncategorised: [],
        };
        for (const [cat, catTasks] of Object.entries(moved)) {
          result[cat as TaskCategory] = catTasks.map((t) => ({
            ...t,
            category: cat as TaskCategory,
          }));
        }
        updatePreviewTasks(
          mergeActiveTaskOrder(currentTasks, flattenTasks(result)),
        );
      } catch {
        // Drag over handler error; revert to previous state
      }
    },
    [updatePreviewTasks],
  );

  const handleDragEnd = useCallback(
    (event: Parameters<DragEndEvent>[0]) => {
      setIsDragging(false);
      const source = event.operation.source;
      if (isSortable(source) && source.type === "subtask") {
        updatePreviewTasks(null);
        if (event.canceled) return;

        const target = event.operation.target;
        if (target && (!isSortable(target) || target.type !== "subtask")) {
          return;
        }
        const sourceId = String(source.id).replace(/^subtask-/, "");
        const targetId = target
          ? String(target.id).replace(/^subtask-/, "")
          : null;
        const before = target ? source.index > target.index : false;
        void reorderSubtasks(sourceId, targetId, before);
        return;
      }
      const nextTasks = previewTasksRef.current;
      if (event.canceled || !nextTasks) {
        updatePreviewTasks(null);
        return;
      }
      void reorderTasks(nextTasks).finally(() => updatePreviewTasks(null));
    },
    [reorderSubtasks, reorderTasks, updatePreviewTasks],
  );

  return (
    <div
      ref={taskFocusScopeRef}
      data-task-focus-scope="matrix"
      className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8"
    >
      <TaskPageHeader
        isDragging={isDragging}
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        sortMode={sortMode}
        onSortModeChange={setSortMode}
      />

      {isSearchActive && visibleTasks.length === 0 && (
        <p
          className="task-panel rounded-box border-base-content/15 bg-base-200 text-base-content/70 mx-auto mt-6 w-full max-w-5xl border p-4 text-center shadow-sm"
          role="status"
        >
          No tasks match “{searchQuery.trim()}”.
        </p>
      )}

      <DragDropProvider
        sensors={[
          PointerSensor.configure({
            activationConstraints: [
              new PointerActivationConstraints.Distance({ value: 5 }),
              new PointerActivationConstraints.Delay({
                value: 200,
                tolerance: 10,
              }),
            ],
            preventActivation: (event, source) => {
              // Only allow pointer drag to start from the drag handle
              const handle = source.element?.querySelector(
                '[aria-label^="Drag to reorder"]',
              );
              if (!handle) {
                return false;
              }
              return !(
                event.target instanceof Node && handle.contains(event.target)
              );
            },
          }),
          KeyboardSensor,
        ]}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <section className="mt-8 space-y-6" aria-label="Task categories">
          <div className="mx-auto w-full max-w-3xl">
            <Column
              title="Uncategorised"
              category="uncategorised"
              inputPlaceholder=""
              isDragging={isDragging}
              isSortingDisabled={isSearchActive || sortMode === "due-date"}
              tasks={visibleTasks}
              taskSurface="matrix"
              onTaskExitStart={handleTaskExitStart}
              onTaskExitEnd={handleTaskExitEnd}
            />
          </div>
          <div className="grid w-full grid-cols-1 gap-6 lg:grid-cols-2">
            <Column
              title="Urgent and Important"
              category="urgent-important"
              inputPlaceholder="Finish assignment due in an hour..."
              isDragging={isDragging}
              isSortingDisabled={isSearchActive || sortMode === "due-date"}
              tasks={visibleTasks}
              taskSurface="matrix"
              onTaskExitStart={handleTaskExitStart}
              onTaskExitEnd={handleTaskExitEnd}
            />
            <Column
              title="Not Urgent but Important"
              category="not-urgent-important"
              inputPlaceholder="Practice Spanish for 30 minutes..."
              isDragging={isDragging}
              isSortingDisabled={isSearchActive || sortMode === "due-date"}
              tasks={visibleTasks}
              taskSurface="matrix"
              onTaskExitStart={handleTaskExitStart}
              onTaskExitEnd={handleTaskExitEnd}
            />
            <Column
              title="Urgent but Not Important"
              category="urgent-not-important"
              inputPlaceholder="Wash the dishes..."
              isDragging={isDragging}
              isSortingDisabled={isSearchActive || sortMode === "due-date"}
              tasks={visibleTasks}
              taskSurface="matrix"
              onTaskExitStart={handleTaskExitStart}
              onTaskExitEnd={handleTaskExitEnd}
            />
            <Column
              title="Not Urgent nor Important"
              category="not-urgent-not-important"
              inputPlaceholder="Watch Netflix..."
              isDragging={isDragging}
              isSortingDisabled={isSearchActive || sortMode === "due-date"}
              tasks={visibleTasks}
              taskSurface="matrix"
              onTaskExitStart={handleTaskExitStart}
              onTaskExitEnd={handleTaskExitEnd}
            />
          </div>
        </section>
        <TaskArchive
          groups={completedTaskGroups}
          hiddenTaskIds={exitingTaskIds}
          buttonRef={archiveDisclosureRef}
          onTaskReopened={handleTaskReopened}
        />
      </DragDropProvider>
    </div>
  );
};

export default TasksRoute;
