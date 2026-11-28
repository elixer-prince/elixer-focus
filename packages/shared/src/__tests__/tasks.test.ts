import {
  assertValidSubtasks,
  createSubtaskStore,
  createTaskStore,
  filterTasksByQuery,
  getCompletedTaskGroups,
  removeSubtaskTree,
  reorderSubtasks,
  sortTasksByDueAt,
  type Subtask,
  type Task,
} from "@elixer-focus/shared/tasks";
import { describe, expect, it, vi } from "vitest";

const createTask = (id: string, overrides: Partial<Task> = {}): Task => ({
  id,
  title: id,
  category: "uncategorised",
  isCompleted: false,
  isSelected: false,
  createdAt: 0,
  updatedAt: 0,
  ...overrides,
});

const createSubtask = (
  id: string,
  overrides: Partial<Subtask> = {},
): Subtask => ({
  id,
  taskId: "task-1",
  parentSubtaskId: null,
  title: id,
  isCompleted: false,
  position: 0,
  createdAt: 0,
  updatedAt: 0,
  ...overrides,
});

describe("shared task stores", () => {
  it("creates, completes, updates, and clears task deadlines with supplied values", () => {
    let timestamp = 100;
    const store = createTaskStore({
      idGenerator: () => "task-1",
      getCurrentTimestamp: () => timestamp,
    });

    const task = store.getState().addTask("Write a plan");
    expect(task).toMatchObject({
      id: "task-1",
      title: "Write a plan",
      category: "uncategorised",
      isCompleted: false,
      isSelected: false,
      createdAt: 100,
      updatedAt: 100,
      defaultDurationMinutes: 30,
    });

    timestamp = 200;
    store.getState().toggleTaskCompletion(task.id, true);
    expect(store.getState().tasks[0]).toMatchObject({
      isCompleted: true,
      completedAt: 200,
      updatedAt: 200,
    });

    timestamp = 300;
    store.getState().updateTask(task.id, { dueAt: 400 });
    expect(store.getState().tasks[0].dueAt).toBe(400);
    store.getState().updateTask(task.id, { dueAt: null });
    expect(store.getState().tasks[0]).not.toHaveProperty("dueAt");
    expect(store.getState().tasks[0].updatedAt).toBe(300);
  });

  it("accepts optional persistence adapters for both store factories", () => {
    const taskStorage = {
      getItem: vi.fn(() => null),
      setItem: vi.fn(),
      removeItem: vi.fn(),
    };
    const taskStore = createTaskStore({
      idGenerator: () => "task-1",
      persistOptions: { name: "tasks", storage: taskStorage },
    });
    const subtaskStore = createSubtaskStore({
      idGenerator: () => "subtask-1",
      getTasks: () => [createTask("task-1")],
      persistOptions: { name: "subtasks", storage: taskStorage },
    });

    taskStore.getState().addTask("Persisted task");
    subtaskStore.getState().addSubtask("task-1", null, "Persisted subtask");

    expect(taskStore.persist.getOptions().name).toBe("tasks");
    expect(subtaskStore.persist.getOptions().name).toBe("subtasks");
    expect(taskStorage.setItem).toHaveBeenCalledTimes(2);
  });

  it("creates nested Subtasks with dense sibling positions and removes a subtree", () => {
    const task = createTask("task-1");
    let nextId = 0;
    const store = createSubtaskStore({
      idGenerator: () => `subtask-${++nextId}`,
      getTasks: () => [task],
      getCurrentTimestamp: () => 50,
    });

    const first = store.getState().addSubtask(task.id, null, " First ");
    const child = store.getState().addSubtask(task.id, first.id, "Child");
    const second = store.getState().addSubtask(task.id, null, "Second");

    expect(first).toMatchObject({
      title: "First",
      position: 0,
      isCompleted: false,
      createdAt: 50,
      updatedAt: 50,
    });
    expect(child.parentSubtaskId).toBe(first.id);
    expect(second.position).toBe(1);
    assertValidSubtasks([task], store.getState().subtasks);

    store.getState().reorderSubtask(second.id, first.id, true);
    expect(
      store.getState().subtasks.map(({ id, position }) => [id, position]),
    ).toEqual([
      [first.id, 1],
      [child.id, 0],
      [second.id, 0],
    ]);

    store.getState().removeSubtask(first.id);
    expect(store.getState().subtasks).toEqual([
      expect.objectContaining({ id: second.id, position: 0 }),
    ]);
  });

  it("rejects invalid Subtask creation and duplicate generated IDs", () => {
    const task = createTask("task-1");
    const store = createSubtaskStore({
      idGenerator: () => "same-id",
      getTasks: () => [task],
    });

    expect(() => store.getState().addSubtask(task.id, null, "  ")).toThrow(
      "Enter a subtask title.",
    );
    expect(() =>
      store.getState().addSubtask(task.id, "missing", "Child"),
    ).toThrow("This parent subtask is no longer available.");
    store.getState().addSubtask(task.id, null, "First");
    expect(() => store.getState().addSubtask(task.id, null, "Second")).toThrow(
      "Unable to create a unique subtask.",
    );
  });
});

describe("shared task utilities", () => {
  it("filters by title or description without changing the source array", () => {
    const tasks = [
      createTask("one", { title: "Plan a week", description: "Review goals" }),
      createTask("two", { title: "Write a report" }),
    ];

    expect(filterTasksByQuery(tasks, "  GOALS ")).toEqual([tasks[0]]);
    expect(filterTasksByQuery(tasks, "  ")).toBe(tasks);
  });

  it("sorts due dates by category and groups completed tasks by completion time", () => {
    const tasks = [
      createTask("later", {
        category: "urgent-important",
        dueAt: 200,
      }),
      createTask("earlier", {
        category: "urgent-important",
        dueAt: 100,
      }),
      createTask("completed", {
        category: "urgent-important",
        isCompleted: true,
        completedAt: 300,
      }),
    ];

    expect(sortTasksByDueAt(tasks).map(({ id }) => id)).toEqual([
      "earlier",
      "later",
      "completed",
    ]);
    expect(getCompletedTaskGroups(tasks)).toEqual([
      { category: "urgent-important", tasks: [tasks[2]] },
    ]);
  });

  it("rejects duplicate IDs, cross Task parents, cycles, sparse positions, and stale reorder targets", () => {
    const task = createTask("task-1");
    const duplicate = [
      createSubtask("same"),
      createSubtask("same", { position: 1 }),
    ];
    expect(() => assertValidSubtasks([task], duplicate)).toThrow(
      "Subtask IDs must be unique.",
    );

    const wrongParent = [
      createSubtask("parent", { taskId: "task-2" }),
      createSubtask("child", { parentSubtaskId: "parent" }),
    ];
    expect(() =>
      assertValidSubtasks([task, createTask("task-2")], wrongParent),
    ).toThrow("A subtask parent must belong to the same task.");

    const cycle = [
      createSubtask("first", { parentSubtaskId: "second" }),
      createSubtask("second", { parentSubtaskId: "first" }),
    ];
    expect(() => assertValidSubtasks([task], cycle)).toThrow(
      "Subtask parent links cannot contain cycles.",
    );

    const sparse = [createSubtask("sparse", { position: 1 })];
    expect(() => assertValidSubtasks([task], sparse)).toThrow(
      "Subtask sibling positions must be dense.",
    );
    expect(() =>
      reorderSubtasks([createSubtask("one")], "one", "stale", true),
    ).toThrow("The subtask you moved onto is no longer available.");
  });

  it("deletes descendants and compacts remaining sibling positions", () => {
    const subtasks = [
      createSubtask("first", { position: 0 }),
      createSubtask("child", { parentSubtaskId: "first" }),
      createSubtask("second", { position: 1 }),
    ];

    expect(removeSubtaskTree(subtasks, "first")).toEqual([
      expect.objectContaining({ id: "second", position: 0 }),
    ]);
  });
});
