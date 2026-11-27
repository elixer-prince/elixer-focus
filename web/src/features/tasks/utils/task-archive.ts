import type { Task, TaskCategory } from "@/features/tasks/types/task";

export const TASK_CATEGORY_ORDER: TaskCategory[] = [
  "urgent-important",
  "not-urgent-important",
  "urgent-not-important",
  "not-urgent-not-important",
  "uncategorised",
];

export const TASK_CATEGORY_LABELS: Record<TaskCategory, string> = {
  "urgent-important": "Urgent and Important",
  "not-urgent-important": "Not Urgent but Important",
  "urgent-not-important": "Urgent but Not Important",
  "not-urgent-not-important": "Not Urgent nor Important",
  uncategorised: "Uncategorised",
};

export type CompletedTaskGroup = {
  category: TaskCategory;
  tasks: Task[];
};

export const getActiveTasks = (tasks: Task[]) =>
  tasks.filter((task) => !task.isCompleted);

export const mergeActiveTaskOrder = (
  tasks: Task[],
  reorderedActiveTasks: Task[],
) => {
  let activeIndex = 0;
  return tasks.map((task) =>
    task.isCompleted ? task : (reorderedActiveTasks[activeIndex++] ?? task),
  );
};

export const getCompletedTaskGroups = (tasks: Task[]) =>
  TASK_CATEGORY_ORDER.flatMap((category) => {
    const completedTasks = tasks
      .map((task, position) => ({ task, position }))
      .filter(({ task }) => task.isCompleted && task.category === category)
      .sort(
        (a, b) =>
          (b.task.completedAt ?? b.task.updatedAt) -
            (a.task.completedAt ?? a.task.updatedAt) || a.position - b.position,
      )
      .map(({ task }) => task);

    return completedTasks.length > 0
      ? [{ category, tasks: completedTasks }]
      : [];
  });

export const getHighestPriorityActiveCategory = (tasks: Task[]): TaskCategory =>
  TASK_CATEGORY_ORDER.find((category) =>
    tasks.some((task) => task.category === category && !task.isCompleted),
  ) ?? "uncategorised";
