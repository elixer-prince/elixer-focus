import { useTasksStore } from "@/features/tasks/stores/tasks-store";
import type { TaskCategory } from "@/features/tasks/types/task";
import { act } from "@testing-library/react";

const createTask = (id: string, title: string, category?: TaskCategory) => ({
  id,
  title,
  description: `Description for ${title}`,
  category: category || ("uncategorised" as TaskCategory),
  isCompleted: false,
  isSelected: false,
  createdAt: 0,
});

beforeEach(() => {
  useTasksStore.setState({
    tasks: [
      createTask("1", "Task 1"),
      createTask("2", "Task 2", "urgent-important"),
    ],
  });
});

describe("Tasks Store", () => {
  describe("setTasks", () => {
    it("should override the tasks in the store", () => {
      const setTasks = useTasksStore.getState().setTasks;

      const mockTasks = [createTask("1", "Task Override")];

      act(() => {
        setTasks(mockTasks);
      });

      const tasks = useTasksStore.getState().tasks;

      expect(tasks.length).toBe(1);
      expect(tasks[0].title).toBe("Task Override");
    });
  });

  describe("addTask", () => {
    it("should add a new task to the store when given the title, description and category", () => {
      const addTask = useTasksStore.getState().addTask;

      act(() => {
        addTask(
          "New Task",
          "Description for New Task",
          "urgent-important" as TaskCategory,
        );
      });

      const tasks = useTasksStore.getState().tasks;

      expect(tasks.length).toBe(3);
      expect(tasks[0].title).toBe("New Task");
    });

    it("should default to uncategorised when not given the category", () => {
      const addTask = useTasksStore.getState().addTask;

      act(() => {
        addTask("New Task", "Description for New Task");
      });

      const tasks = useTasksStore.getState().tasks;

      expect(tasks.length).toBe(3);
      expect(tasks[0].title).toBe("New Task");
      expect(tasks[0].category).toBe("uncategorised");
    });
  });

  describe("removeTask", () => {
    it("should remove a specific task from the store by id", () => {
      const removeTask = useTasksStore.getState().removeTask;

      act(() => {
        removeTask("1");
      });

      const tasks = useTasksStore.getState().tasks;
      const task = useTasksStore.getState().tasks.find((t) => t.id === "1");

      expect(tasks.length).toBe(1);
      expect(task).toBeUndefined();
    });

    it("should not change tasks when removing a non-existent id", () => {
      const removeTask = useTasksStore.getState().removeTask;

      act(() => {
        removeTask("999");
      });

      expect(useTasksStore.getState().tasks.length).toBe(2);
    });
  });

  describe("toggleTaskCompletion", () => {
    it("should toggle the completion status of a specific task", () => {
      const toggleTaskCompletion =
        useTasksStore.getState().toggleTaskCompletion;

      act(() => {
        toggleTaskCompletion("1", true);
      });

      const task = useTasksStore.getState().tasks.find((t) => t.id === "1");

      expect(task?.isCompleted).toBe(true);
    });
  });
});
