import { useTimerRunning } from "@/features/countdown-timer/stores/countdown-store";
import Column from "@/features/tasks/components/Column/Index";
import TaskPageHeader from "@/features/tasks/components/TaskPageHeader";
import { useReorderTasks, useTasksStore } from "@/stores";
import type { Task, TaskCategory } from "@/features/tasks/types/task";
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

const CATEGORIES: TaskCategory[] = [
  "urgent-important",
  "not-urgent-important",
  "urgent-not-important",
  "not-urgent-not-important",
  "uncategorised",
];

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

const Tasks = () => {
  const { updatePageTitle } = usePageTitle();
  const timerRunning = useTimerRunning();

  if (!timerRunning) updatePageTitle("Elixer Focus - Tasks");

  const [previewTasks, setPreviewTasks] = useState<Task[] | null>(null);
  const previewTasksRef = useRef<Task[] | null>(null);
  const updatePreviewTasks = useCallback((nextTasks: Task[] | null) => {
    previewTasksRef.current = nextTasks;
    setPreviewTasks(nextTasks);
  }, []);
  const reorderTasks = useReorderTasks();
  const [isDragging, setIsDragging] = useState(false);

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
        const grouped = groupByCategory(currentTasks);
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
        updatePreviewTasks(flattenTasks(result));
      } catch {
        // Drag over handler error; revert to previous state
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

  return (
    <div className="p-12 max-sm:px-4">
      <TaskPageHeader isDragging={isDragging} />

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
        <div className="tasks-container mt-8 flex flex-col items-center gap-8">
          <Column
            title="Uncategorised"
            category="uncategorised"
            inputPlaceholder=""
            isDragging={isDragging}
            tasks={previewTasks ?? undefined}
          />
          <div className="tasks-row flex flex-wrap justify-center gap-8">
            <Column
              title="Urgent and Important"
              category="urgent-important"
              inputPlaceholder="Finish assignment due in an hour..."
              isDragging={isDragging}
              tasks={previewTasks ?? undefined}
            />
            <Column
              title="Not Urgent but Important"
              category="not-urgent-important"
              inputPlaceholder="Practice Spanish for 30 minutes..."
              isDragging={isDragging}
              tasks={previewTasks ?? undefined}
            />
          </div>
          <div className="tasks-row flex flex-wrap justify-center gap-8">
            <Column
              title="Urgent but Not Important"
              category="urgent-not-important"
              inputPlaceholder="Wash the dishes..."
              isDragging={isDragging}
              tasks={previewTasks ?? undefined}
            />
            <Column
              title="Not Urgent nor Important"
              category="not-urgent-not-important"
              inputPlaceholder="Watch Netflix..."
              isDragging={isDragging}
              tasks={previewTasks ?? undefined}
            />
          </div>
        </div>
      </DragDropProvider>
    </div>
  );
};

export default Tasks;
