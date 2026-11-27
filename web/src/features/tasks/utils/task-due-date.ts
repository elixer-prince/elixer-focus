import type { Task } from "@/features/tasks/types/task";
import { TASK_CATEGORY_ORDER } from "@/features/tasks/utils/task-archive";

export type TaskSortMode = "manual" | "due-date";

const pad = (value: number) => String(value).padStart(2, "0");

export const formatDueAtForInput = (dueAt: number) => {
  const date = new Date(dueAt);
  const year = String(date.getFullYear()).padStart(4, "0");

  return `${year}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

export const parseDueAtInput = (value: string): number | null => {
  if (!value) return null;

  const dueAt = new Date(value).getTime();
  return Number.isNaN(dueAt) ? null : dueAt;
};

export const formatDueAt = (dueAt: number) =>
  new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(dueAt));

export const sortTasksByDueAt = (tasks: Task[]) =>
  TASK_CATEGORY_ORDER.flatMap((category) =>
    tasks
      .filter((task) => task.category === category)
      .sort((left, right) => {
        if (left.dueAt === undefined) {
          return right.dueAt === undefined ? 0 : 1;
        }
        if (right.dueAt === undefined) return -1;
        return left.dueAt - right.dueAt;
      }),
  );
