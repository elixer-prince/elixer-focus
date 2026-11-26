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
};

export type TaskCategory =
  | "urgent-important"
  | "not-urgent-important"
  | "urgent-not-important"
  | "not-urgent-not-important"
  | "uncategorised";
