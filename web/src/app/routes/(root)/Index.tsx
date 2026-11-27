import CountdownTimerContainer from "@/features/countdown-timer/components/Index";
import { useTimerRunning } from "@/features/countdown-timer/stores/countdown-store";
import Column from "@/features/tasks/components/Column/Index";
import { useReorderTasks, useTasks, useTasksStore } from "@/stores";
import type { Task, TaskCategory } from "@/features/tasks/types/task";
import {
  getActiveTasks,
  getHighestPriorityActiveCategory,
  mergeActiveTaskOrder,
  TASK_CATEGORY_LABELS,
  TASK_CATEGORY_ORDER,
} from "@/features/tasks/utils/task-archive";
import { move } from "@dnd-kit/helpers";
import { DragDropProvider, PointerSensor } from "@dnd-kit/react";
import { isSortable } from "@dnd-kit/react/sortable";
import {
  KeyboardSensor,
  PointerActivationConstraints,
  type DragEndEvent,
  type DragOverEvent,
} from "@dnd-kit/dom";
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

const HomeRoute = () => {
  const { updatePageTitle } = usePageTitle();

  const timerRunning = useTimerRunning();

  const tasks = useTasks();
  const taskFocusScopeRef = useRef<HTMLDivElement>(null);
  const [previewTasks, setPreviewTasks] = useState<Task[] | null>(null);
  const [completionCategory, setCompletionCategory] =
    useState<TaskCategory | null>(null);
  const previewTasksRef = useRef<Task[] | null>(null);
  const updatePreviewTasks = useCallback((nextTasks: Task[] | null) => {
    previewTasksRef.current = nextTasks;
    setPreviewTasks(nextTasks);
  }, []);
  const activeCategory =
    completionCategory ??
    getHighestPriorityActiveCategory(previewTasks ?? tasks);
  const reorderTasks = useReorderTasks();
  const [isDragging, setIsDragging] = useState(false);

  const handleTaskExitEnd = useCallback((id: string, wasFocused: boolean) => {
    setCompletionCategory(null);
    if (!wasFocused) return;
    const taskRows = Array.from(
      taskFocusScopeRef.current?.querySelectorAll<HTMLLIElement>(
        'li[data-task-surface="home"]',
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
      window.requestAnimationFrame(() => {
        const nextActiveTask =
          taskFocusScopeRef.current?.querySelector<HTMLLIElement>(
            'li[data-task-surface="home"]',
          );
        if (nextActiveTask) {
          nextActiveTask.focus();
        } else {
          taskFocusScopeRef.current
            ?.querySelector<HTMLUListElement>('ul[data-task-list="home"]')
            ?.focus();
        }
      });
    }
  }, []);

  const handleTaskExitStart = useCallback(() => {
    setCompletionCategory(activeCategory);
  }, [activeCategory]);

  const handleDragStart = useCallback(() => {
    updatePreviewTasks(
      useTasksStore.getState().tasks.map((task) => ({ ...task })),
    );
    setIsDragging(true);
  }, [updatePreviewTasks]);

  const handleDragOver = useCallback(
    (event: Parameters<DragOverEvent>[0]) => {
      try {
        const { source } = event.operation;
        if (!isSortable(source)) return;

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
        // Drag over handler error, revert to previous state
      }
    },
    [updatePreviewTasks],
  );

  const handleDragEnd = useCallback(
    (event: Parameters<DragEndEvent>[0]) => {
      setIsDragging(false);
      const nextTasks = previewTasksRef.current;
      if (event.canceled || !nextTasks) {
        updatePreviewTasks(null);
        return;
      }
      void reorderTasks(nextTasks).finally(() => updatePreviewTasks(null));
    },
    [reorderTasks, updatePreviewTasks],
  );

  if (!timerRunning) updatePageTitle("Elixer Focus - Home");

  return (
    <div
      ref={taskFocusScopeRef}
      id="main-wrapper"
      className="flex flex-col items-center justify-center gap-8 p-8"
    >
      <CountdownTimerContainer />

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
              const handle = source.element?.querySelector(
                '[aria-label="Drag to reorder"]',
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
        <Column
          title={TASK_CATEGORY_LABELS[activeCategory]}
          category={activeCategory}
          inputPlaceholder=""
          isDragging={isDragging}
          tasks={previewTasks ?? undefined}
          onTaskExitStart={handleTaskExitStart}
          onTaskExitEnd={handleTaskExitEnd}
        />
      </DragDropProvider>
    </div>
  );
};

export default HomeRoute;
