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
});
