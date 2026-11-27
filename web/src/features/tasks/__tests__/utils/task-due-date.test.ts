import type { Task } from "@/features/tasks/types/task";
import {
  formatDueAt,
  formatDueAtForInput,
  parseDueAtInput,
  sortTasksByDueAt,
} from "@/features/tasks/utils/task-due-date";

const createTask = (
  id: string,
  category: Task["category"],
  dueAt?: number,
): Task => ({
  id,
  title: id,
  category,
  isCompleted: false,
  isSelected: false,
  createdAt: 0,
  updatedAt: 0,
  ...(dueAt !== undefined ? { dueAt } : {}),
});

describe("task due date utilities", () => {
  it("converts between local date and time input values and epoch milliseconds", () => {
    const dueAt = new Date(2026, 10, 27, 14, 35).getTime();
    const inputValue = "2026-11-27T14:35";

    expect(formatDueAtForInput(dueAt)).toBe(inputValue);
    expect(parseDueAtInput(inputValue)).toBe(dueAt);
    expect(parseDueAtInput("")).toBeNull();
  });

  it("formats deadline display using the browser locale and timezone", () => {
    const dueAt = new Date(2026, 10, 27, 14, 35).getTime();

    expect(formatDueAt(dueAt)).toBe(
      new Intl.DateTimeFormat(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date(dueAt)),
    );
  });

  it("sorts within category, keeps equal deadlines stable, and leaves undated tasks last", () => {
    const tasks = [
      createTask("later", "urgent-important", 2300),
      createTask("tie-first", "urgent-important", 2200),
      createTask("undated", "urgent-important"),
      createTask("other-category", "not-urgent-important", 1000),
      createTask("earlier", "urgent-important", 2100),
      createTask("tie-second", "urgent-important", 2200),
    ];

    expect(sortTasksByDueAt(tasks).map(({ id }) => id)).toEqual([
      "earlier",
      "tie-first",
      "tie-second",
      "later",
      "undated",
      "other-category",
    ]);
    expect(tasks.map(({ id }) => id)).toEqual([
      "later",
      "tie-first",
      "undated",
      "other-category",
      "earlier",
      "tie-second",
    ]);
  });
});
