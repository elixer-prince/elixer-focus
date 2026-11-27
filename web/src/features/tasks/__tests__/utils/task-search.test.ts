import { filterTasksByQuery } from "@/features/tasks/utils/task-search";
import type { Task } from "@/features/tasks/types/task";

const tasks: Task[] = [
  {
    id: "1",
    title: "Plan the week",
    description: "Review upcoming goals",
    category: "not-urgent-important",
    isCompleted: false,
    isSelected: false,
    createdAt: 0,
    updatedAt: 0,
  },
  {
    id: "2",
    title: "Write a report",
    category: "urgent-important",
    isCompleted: false,
    isSelected: false,
    createdAt: 0,
    updatedAt: 0,
  },
];

describe("filterTasksByQuery", () => {
  it("matches titles and descriptions without case sensitivity", () => {
    expect(filterTasksByQuery(tasks, "WEEK")).toEqual([tasks[0]]);
    expect(filterTasksByQuery(tasks, "upcoming")).toEqual([tasks[0]]);
  });

  it("trims the query and returns all tasks when it is empty", () => {
    expect(filterTasksByQuery(tasks, "  report  ")).toEqual([tasks[1]]);
    expect(filterTasksByQuery(tasks, "   ")).toBe(tasks);
  });

  it("returns an empty list when nothing matches", () => {
    expect(filterTasksByQuery(tasks, "unmatched")).toEqual([]);
  });
});
