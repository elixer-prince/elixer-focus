import {
  getActiveTasks,
  getCompletedTaskGroups,
  getHighestPriorityActiveCategory,
  mergeActiveTaskOrder,
} from "@/features/tasks/utils/task-archive";
import type { Task } from "@/features/tasks/types/task";

const createTask = (overrides: Partial<Task> & Pick<Task, "id" | "category">) =>
  ({
    title: overrides.id,
    isCompleted: false,
    isSelected: false,
    createdAt: 0,
    updatedAt: 0,
    ...overrides,
  }) as Task;

describe("task archive helpers", () => {
  it("AC-3: groups completed tasks by category and sorts by completion time with a stable fallback", () => {
    const tasks = [
      createTask({
        id: "equal-first",
        category: "urgent-important",
        isCompleted: true,
        completedAt: 500,
        updatedAt: 10,
      }),
      createTask({
        id: "older-category",
        category: "not-urgent-important",
        isCompleted: true,
        completedAt: 100,
        updatedAt: 300,
      }),
      createTask({
        id: "fallback-newer",
        category: "urgent-important",
        isCompleted: true,
        updatedAt: 600,
      }),
      createTask({
        id: "equal-second",
        category: "urgent-important",
        isCompleted: true,
        completedAt: 500,
        updatedAt: 20,
      }),
      createTask({
        id: "active",
        category: "urgent-important",
        isCompleted: false,
        updatedAt: 700,
      }),
    ];
    const original = structuredClone(tasks);

    expect(getCompletedTaskGroups(tasks)).toEqual([
      {
        category: "urgent-important",
        tasks: [
          expect.objectContaining({ id: "fallback-newer" }),
          expect.objectContaining({ id: "equal-first" }),
          expect.objectContaining({ id: "equal-second" }),
        ],
      },
      {
        category: "not-urgent-important",
        tasks: [expect.objectContaining({ id: "older-category" })],
      },
    ]);
    expect(tasks).toEqual(original);
    expect(
      tasks.find((task) => task.id === "fallback-newer"),
    ).not.toHaveProperty("completedAt");
    expect(
      getCompletedTaskGroups(
        tasks.map((task) => ({ ...task, isCompleted: false })),
      ),
    ).toEqual([]);
  });

  it("AC-1 and AC-2: keeps only incomplete tasks active and selects the highest priority active category", () => {
    const tasks = [
      createTask({
        id: "completed-high",
        category: "urgent-important",
        isCompleted: true,
      }),
      createTask({ id: "lower", category: "urgent-not-important" }),
      createTask({ id: "uncategorised", category: "uncategorised" }),
    ];

    expect(getActiveTasks(tasks).map((task) => task.id)).toEqual([
      "lower",
      "uncategorised",
    ]);
    expect(getHighestPriorityActiveCategory(tasks)).toBe(
      "urgent-not-important",
    );
    expect(
      getHighestPriorityActiveCategory(
        tasks.map((task) => ({ ...task, isCompleted: true })),
      ),
    ).toBe("uncategorised");
  });

  it("AC-5: reorders active tasks without moving completed task positions", () => {
    const first = createTask({
      id: "first",
      category: "urgent-important",
    });
    const completed = createTask({
      id: "completed",
      category: "urgent-important",
      isCompleted: true,
      completedAt: 100,
    });
    const second = createTask({
      id: "second",
      category: "not-urgent-important",
    });

    expect(
      mergeActiveTaskOrder([first, completed, second], [second, first]),
    ).toEqual([second, completed, first]);
  });
});
