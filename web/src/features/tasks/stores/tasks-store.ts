import { create } from "zustand";
import { persist } from "zustand/middleware";

type TaskState = {
  tasks: string[];
};

type TaskActions = {
  addTask: (task: string) => void;
  removeTask: (task: string) => void;
};

const useTasksStore = create<TaskState & TaskActions>()(
  persist(
    (set) => ({
      tasks: [],

      addTask: (task) => {
        set((state) => ({
          tasks: [task, ...state.tasks],
        }));
      },

      removeTask: (task) => {
        set((state) => ({
          tasks: state.tasks.filter((t) => t !== task),
        }));
      },
    }),
    {
      name: "tasks-storage",
    },
  ),
);

// States

export const useTasks = () => useTasksStore((state) => state.tasks);

// Actions

export const useAddTask = () => useTasksStore((state) => state.addTask);

export const useRemoveTask = () => useTasksStore((state) => state.removeTask);
