import type { TaskCategory } from "@/features/tasks/types/task";
import { act } from "@testing-library/react";

vi.mock("@/utils/date", () => ({
  getCurrentTimestamp: vi.fn(),
}));

import { useTasksStore } from "@/features/tasks/stores/tasks-store";
import { getCurrentTimestamp } from "@/utils/date";

const createTask = (id: string, title: string, category?: TaskCategory) => ({
  id,
  title,
  description: `Description for ${title}`,
  category: category || ("uncategorised" as TaskCategory),
  isCompleted: false,
  isSelected: false,
  createdAt: 0,
  updatedAt: 0,
});

const randomUUIDMock = vi.fn();
const getCurrentTimestampMock = vi.mocked(getCurrentTimestamp);

const seedTasks = () => [
  createTask("1", "Task 1"),
  createTask("2", "Task 2", "urgent-important"),
];

const getTasks = () => useTasksStore.getState().tasks;

beforeEach(() => {
  localStorage.clear();
  vi.clearAllMocks();
  randomUUIDMock.mockReturnValue("task-uuid-1");
  vi.stubGlobal("crypto", { randomUUID: randomUUIDMock });
  useTasksStore.setState({ tasks: seedTasks() });
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("Tasks Store", () => {
  describe("setTasks", () => {
    it("should override the tasks in the store", () => {
      const setTasks = useTasksStore.getState().setTasks;

      const mockTasks = [createTask("1", "Task Override")];

      act(() => {
        setTasks(mockTasks);
      });

      const tasks = getTasks();

      expect(tasks).toEqual([mockTasks[0]]);
    });
  });

  describe("addTask", () => {
    it("should add a new task to the store when given the title, description and category", () => {
      const addTask = useTasksStore.getState().addTask;
      getCurrentTimestampMock.mockReturnValue(123456);

      act(() => {
        addTask(
          "New Task",
          "Description for New Task",
          "urgent-important" as TaskCategory,
        );
      });

      const tasks = getTasks();

      expect(tasks.length).toBe(3);
      expect(tasks[0]).toEqual({
        id: "task-uuid-1",
        title: "New Task",
        description: "Description for New Task",
        category: "urgent-important",
        isCompleted: false,
        isSelected: false,
        createdAt: 123456,
        updatedAt: 123456,
      });
    });

    it("should default to uncategorised when not given the category", () => {
      const addTask = useTasksStore.getState().addTask;
      getCurrentTimestampMock.mockReturnValue(789);

      act(() => {
        addTask("New Task", "Description for New Task");
      });

      const tasks = getTasks();

      expect(tasks.length).toBe(3);
      expect(tasks[0].title).toBe("New Task");
      expect(tasks[0].category).toBe("uncategorised");
      expect(tasks[0].createdAt).toBe(789);
    });

    it("should prepend new tasks ahead of existing tasks", () => {
      const addTask = useTasksStore.getState().addTask;
      getCurrentTimestampMock.mockReturnValue(555);

      act(() => {
        addTask("Prepended Task", "Description for Prepended Task");
      });

      const tasks = getTasks();

      expect(tasks[0].title).toBe("Prepended Task");
      expect(tasks[1].id).toBe("1");
    });
  });

  describe("removeTask", () => {
    it("should remove a specific task from the store by id", () => {
      const removeTask = useTasksStore.getState().removeTask;

      act(() => {
        removeTask("1");
      });

      const tasks = getTasks();

      expect(tasks.length).toBe(1);
      expect(tasks[0].id).toBe("2");
    });

    it("should not change tasks when removing a non-existent id", () => {
      const removeTask = useTasksStore.getState().removeTask;

      act(() => {
        removeTask("999");
      });

      expect(getTasks()).toEqual(seedTasks());
    });
  });

  describe("toggleTaskCompletion", () => {
    it("should update the completion status of a specific task", () => {
      const toggleTaskCompletion =
        useTasksStore.getState().toggleTaskCompletion;

      act(() => {
        toggleTaskCompletion("1", true);
      });

      const task = getTasks().find((t) => t.id === "1");

      expect(task?.isCompleted).toBe(true);
    });

    it("should not affect other tasks", () => {
      const toggleTaskCompletion =
        useTasksStore.getState().toggleTaskCompletion;

      act(() => {
        toggleTaskCompletion("1", true);
      });

      const unaffectedTask = getTasks().find((t) => t.id === "2");

      expect(unaffectedTask?.isCompleted).toBe(false);
    });
  });

  describe("updateTask", () => {
    it("should update the title of a specific task", () => {
      const updateTask = useTasksStore.getState().updateTask;

      act(() => {
        updateTask("1", { title: "Updated Title" });
      });

      const task = getTasks().find((t) => t.id === "1");

      expect(task?.title).toBe("Updated Title");
    });

    it("should update the description of a specific task", () => {
      const updateTask = useTasksStore.getState().updateTask;

      act(() => {
        updateTask("1", { description: "New description" });
      });

      const task = getTasks().find((t) => t.id === "1");

      expect(task?.description).toBe("New description");
    });

    it("should update both title and description at once", () => {
      const updateTask = useTasksStore.getState().updateTask;

      act(() => {
        updateTask("1", { title: "Both Updated", description: "Both fields" });
      });

      const task = getTasks().find((t) => t.id === "1");

      expect(task?.title).toBe("Both Updated");
      expect(task?.description).toBe("Both fields");
    });

    it("should clear the description when setting it to undefined", () => {
      const updateTask = useTasksStore.getState().updateTask;

      act(() => {
        updateTask("1", { description: undefined });
      });

      const task = getTasks().find((t) => t.id === "1");

      expect(task?.description).toBeUndefined();
    });

    it("should not affect other tasks", () => {
      const updateTask = useTasksStore.getState().updateTask;

      act(() => {
        updateTask("1", { title: "Only Task 1" });
      });

      const unaffectedTask = getTasks().find((t) => t.id === "2");

      expect(unaffectedTask?.title).toBe("Task 2");
    });

    it("should not update a non-existent task", () => {
      const updateTask = useTasksStore.getState().updateTask;
      const originalTasks = getTasks();

      act(() => {
        updateTask("999", { title: "Ghost" });
      });

      expect(getTasks()).toEqual(originalTasks);
    });

    it("should update the updatedAt timestamp", () => {
      const updateTask = useTasksStore.getState().updateTask;
      getCurrentTimestampMock.mockReturnValue(99999);

      act(() => {
        updateTask("1", { title: "Updated Title" });
      });

      const task = getTasks().find((t) => t.id === "1");

      expect(task?.updatedAt).toBe(99999);
    });
  });

  describe("toggleTaskCompletion updatedAt", () => {
    it("should update the updatedAt timestamp when toggling completion", () => {
      const toggleTaskCompletion =
        useTasksStore.getState().toggleTaskCompletion;
      getCurrentTimestampMock.mockReturnValue(88888);

      act(() => {
        toggleTaskCompletion("1", true);
      });

      const task = getTasks().find((t) => t.id === "1");

      expect(task?.updatedAt).toBe(88888);
    });

    it("AC-4: records the completion timestamp when a task is completed", () => {
      const toggleTaskCompletion =
        useTasksStore.getState().toggleTaskCompletion;
      getCurrentTimestampMock.mockReturnValue(88888);

      act(() => {
        toggleTaskCompletion("1", true);
      });

      const task = getTasks().find((t) => t.id === "1");
      expect((task as { completedAt?: number })?.completedAt).toBe(88888);
    });

    it("AC-4: clears the completion timestamp when a task is reopened", () => {
      const toggleTaskCompletion =
        useTasksStore.getState().toggleTaskCompletion;
      getCurrentTimestampMock.mockReturnValueOnce(88888).mockReturnValue(99999);

      act(() => {
        toggleTaskCompletion("1", true);
        toggleTaskCompletion("1", false);
      });

      const task = getTasks().find((t) => t.id === "1");
      expect(task?.isCompleted).toBe(false);
      expect((task as { completedAt?: number })?.completedAt).toBeUndefined();
    });

    it("AC-4: preserves the completion timestamp when task details are edited", () => {
      const toggleTaskCompletion =
        useTasksStore.getState().toggleTaskCompletion;
      const updateTask = useTasksStore.getState().updateTask;
      getCurrentTimestampMock.mockReturnValueOnce(88888).mockReturnValue(99999);

      act(() => {
        toggleTaskCompletion("1", true);
        updateTask("1", { title: "Edited task" });
      });

      const task = getTasks().find((t) => t.id === "1");
      expect(task?.updatedAt).toBe(99999);
      expect((task as { completedAt?: number })?.completedAt).toBe(88888);
    });
  });

  describe("migration", () => {
    it("should backfill updatedAt with createdAt for v1 data", async () => {
      localStorage.clear();
      vi.resetModules();

      // Simulate v1 data without updatedAt
      const v1Data = JSON.stringify({
        state: {
          tasks: [
            {
              id: "1",
              title: "Old Task",
              category: "uncategorised",
              isCompleted: false,
              isSelected: false,
              createdAt: 12345,
            },
          ],
        },
        version: 1,
      });
      localStorage.setItem("tasks-storage", v1Data);

      vi.resetModules();
      const { useTasksStore: ReloadedStore } = await import(
        "@/features/tasks/stores/tasks-store"
      );

      const tasks = ReloadedStore.getState().tasks;
      expect(tasks.length).toBe(1);
      expect(tasks[0].updatedAt).toBe(12345);
    });

    it("AC-4: backfills completedAt for completed v1 tasks", async () => {
      localStorage.clear();
      localStorage.setItem(
        "tasks-storage",
        JSON.stringify({
          state: {
            tasks: [
              {
                id: "1",
                title: "Completed task",
                category: "uncategorised",
                isCompleted: true,
                isSelected: false,
                createdAt: 12345,
              },
            ],
          },
          version: 1,
        }),
      );

      vi.resetModules();
      const { useTasksStore: ReloadedStore } = await import(
        "@/features/tasks/stores/tasks-store"
      );

      const task = ReloadedStore.getState().tasks[0];
      expect(task.updatedAt).toBe(12345);
      expect((task as { completedAt?: number }).completedAt).toBe(12345);
    });

    it("AC-4: backfills completedAt for completed v2 tasks", async () => {
      localStorage.clear();
      localStorage.setItem(
        "tasks-storage",
        JSON.stringify({
          state: {
            tasks: [
              {
                id: "1",
                title: "Completed task",
                category: "uncategorised",
                isCompleted: true,
                isSelected: false,
                createdAt: 12345,
                updatedAt: 67890,
              },
              {
                id: "2",
                title: "Open task",
                category: "uncategorised",
                isCompleted: false,
                isSelected: false,
                createdAt: 12345,
                updatedAt: 67890,
              },
            ],
          },
          version: 2,
        }),
      );

      vi.resetModules();
      const { useTasksStore: ReloadedStore } = await import(
        "@/features/tasks/stores/tasks-store"
      );

      const [completedTask, incompleteTask] = ReloadedStore.getState().tasks;
      expect(completedTask.completedAt).toBe(67890);
      expect(incompleteTask).not.toHaveProperty("completedAt");
    });
  });

  describe("persist configuration", () => {
    it("should declare version 3 in the persist config", () => {
      const stored = localStorage.getItem("tasks-storage");
      expect(stored).not.toBeNull();
      const parsed = JSON.parse(stored!);
      expect(parsed.version).toBe(3);
    });

    it("should include the tasks state in the persisted data", () => {
      const stored = localStorage.getItem("tasks-storage");
      expect(stored).not.toBeNull();
      const parsed = JSON.parse(stored!);
      expect(parsed.state).toHaveProperty("tasks");
    });

    it("should restore tasks from localStorage on reload", async () => {
      localStorage.clear();
      vi.resetModules();

      const { useTasksStore: FreshStore } = await import(
        "@/features/tasks/stores/tasks-store"
      );

      act(() => {
        FreshStore.getState().addTask(
          "Persisted Task",
          "Test",
          "urgent-important",
        );
      });

      const stored = localStorage.getItem("tasks-storage");
      expect(stored).not.toBeNull();

      vi.resetModules();
      const { useTasksStore: ReloadedStore } = await import(
        "@/features/tasks/stores/tasks-store"
      );

      const tasks = ReloadedStore.getState().tasks;
      expect(tasks.length).toBe(1);
      expect(tasks[0].title).toBe("Persisted Task");
    });
  });
});
