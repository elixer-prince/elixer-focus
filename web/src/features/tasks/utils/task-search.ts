import type { Task } from "@/features/tasks/types/task";

export const filterTasksByQuery = (tasks: Task[], query: string): Task[] => {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) return tasks;

  return tasks.filter(
    (task) =>
      task.title.toLowerCase().includes(normalizedQuery) ||
      (task.description ?? "").toLowerCase().includes(normalizedQuery),
  );
};
