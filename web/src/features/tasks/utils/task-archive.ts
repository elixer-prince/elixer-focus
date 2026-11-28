import type { TaskCategory } from "@elixer-focus/shared/tasks";

export {
  TASK_CATEGORY_ORDER,
  getActiveTasks,
  getCompletedTaskGroups,
  getHighestPriorityActiveCategory,
  mergeActiveTaskOrder,
} from "@elixer-focus/shared/tasks";
export type { CompletedTaskGroup } from "@elixer-focus/shared/tasks";

export const TASK_CATEGORY_LABELS: Record<TaskCategory, string> = {
  "urgent-important": "Urgent and Important",
  "not-urgent-important": "Not Urgent but Important",
  "urgent-not-important": "Urgent but Not Important",
  "not-urgent-not-important": "Not Urgent nor Important",
  uncategorised: "Uncategorised",
};
