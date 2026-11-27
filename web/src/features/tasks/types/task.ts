export type Task = {
  id: string;
  title: string;
  description?: string;
  category: TaskCategory;
  isCompleted: boolean;
  isSelected: boolean;
  createdAt: number;
  updatedAt: number;
  completedAt?: number;
  defaultDurationMinutes?: number;
  archivedAt?: number;
  dueAt?: number;
};

export type TaskUpdate = Partial<
  Pick<Task, "title" | "description" | "defaultDurationMinutes" | "archivedAt">
> & {
  dueAt?: number | null;
};

export type TaskCategory =
  | "urgent-important"
  | "not-urgent-important"
  | "urgent-not-important"
  | "not-urgent-not-important"
  | "uncategorised";
