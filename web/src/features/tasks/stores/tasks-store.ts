import type { Task } from "@/features/tasks/types/task";
import { getCurrentTimestamp } from "@/utils/date";
import { create } from "zustand";
import { persist } from "zustand/middleware";

type TaskState = {
  tasks: Task[];
};

type TaskActions = {
  addTask: (task: string, description?: string) => void;
  removeTask: (id: string) => void;
};

const useTasksStore = create<TaskState & TaskActions>()(
  persist(
    (set) => ({
      tasks: [],

      addTask: (title, description) => {
        set((state) => ({
          tasks: [
            {
              id: crypto.randomUUID(),
              title,
              description,
              createdAt: getCurrentTimestamp(),
            },
            ...state.tasks,
          ],
        }));
      },

      removeTask: (id) => {
        set((state) => ({
          tasks: state.tasks.filter((task) => task.id !== id),
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
