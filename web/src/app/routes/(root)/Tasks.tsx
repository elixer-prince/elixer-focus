import { useTimerRunning } from "@/features/countdown-timer/stores/countdown-store";
import Column from "@/features/tasks/components/Column/Index";
import TaskPageHeader from "@/features/tasks/components/TaskPageHeader";
import {
  useSetTasks,
  useTasksStore,
} from "@/features/tasks/stores/tasks-store";
import type { Task, TaskCategory } from "@/features/tasks/types/task";
import { move } from "@dnd-kit/helpers";
import { DragDropProvider } from "@dnd-kit/react";
import { isSortable } from "@dnd-kit/react/sortable";
import type { DragEndEvent, DragOverEvent } from "@dnd-kit/dom";
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

  const setTasks = useSetTasks();
  const [isDragging, setIsDragging] = useState(false);
  const previousTasks = useRef<Task[]>([]);

  const handleDragStart = useCallback(() => {
    previousTasks.current = useTasksStore.getState().tasks;
    setIsDragging(true);
  }, []);

  const handleDragOver = useCallback(
    (event: Parameters<DragOverEvent>[0]) => {
      try {
        const { source } = event.operation;
        if (!isSortable(source)) return;

        const currentTasks = useTasksStore.getState().tasks;
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
        setTasks(flattenTasks(result));
      } catch (error) {
        console.error("Drag over handler error:", error);
      }
    },
    [setTasks],
  );

  const handleDragEnd = useCallback(
    (event: Parameters<DragEndEvent>[0]) => {
      if (event.canceled) {
        setTasks(previousTasks.current);
      }
      setIsDragging(false);
    },
    [setTasks],
  );

  return (
    <div className="p-12 max-sm:px-4">
      <TaskPageHeader disabled={isDragging} />

      <DragDropProvider
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="tasks-container mt-8 flex flex-col items-center gap-8">
          <Column
            title="Uncategorised"
            category="uncategorised"
            inputPlaceholder=""
          />
          <div className="tasks-row flex flex-wrap justify-center gap-8">
            <Column
              title="Urgent and Important"
              category="urgent-important"
              creationDisabled={isDragging}
              inputPlaceholder="Finish assignment due in an hour..."
            />
            <Column
              title="Not Urgent but Important"
              category="not-urgent-important"
              creationDisabled={isDragging}
              inputPlaceholder="Practice Spanish for 30 minutes..."
            />
          </div>
          <div className="tasks-row flex flex-wrap justify-center gap-8">
            <Column
              title="Urgent but Not Important"
              category="urgent-not-important"
              creationDisabled={isDragging}
              inputPlaceholder="Wash the dishes..."
            />
            <Column
              title="Not Urgent nor Important"
              category="not-urgent-not-important"
              creationDisabled={isDragging}
              inputPlaceholder="Watch Netflix..."
            />
          </div>
        </div>
      </DragDropProvider>
    </div>
  );
};

export default Tasks;
