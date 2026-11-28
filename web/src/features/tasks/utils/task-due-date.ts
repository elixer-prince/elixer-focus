export { sortTasksByDueAt } from "@elixer-focus/shared/tasks";
export type { TaskSortMode } from "@elixer-focus/shared/tasks";

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
