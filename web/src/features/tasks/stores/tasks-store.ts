import type { Task } from "@/features/tasks/types/task";
import { getCurrentTimestamp } from "@/utils/date";
import { create } from "zustand";
import { persist } from "zustand/middleware";

type TaskState = {
  tasks: Task[];
};

type TaskActions = {
  setTasks: (tasks: Task[]) => void;
  addTask: (task: string, description?: string) => void;
  removeTask: (id: string) => void;
  toggleTaskCompletion: (id: string, completed: boolean) => void;
};

const useTasksStore = create<TaskState & TaskActions>()(
  persist(
    (set) => ({
      tasks: [],

      setTasks: (tasks: Task[]) => {
        set({ tasks });
      },

      addTask: (title, description) => {
        set((state) => ({
          tasks: [
            {
              id: crypto.randomUUID(),
              title,
              description,
              isCompleted: false,
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
      toggleTaskCompletion: (id, completed) => {
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === id ? { ...t, isCompleted: completed } : t,
          ),
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

export const useSetTasks = () => useTasksStore((state) => state.setTasks);

export const useAddTask = () => useTasksStore((state) => state.addTask);

export const useRemoveTask = () => useTasksStore((state) => state.removeTask);

export const useToggleTaskCompletion = () =>
  useTasksStore((state) => state.toggleTaskCompletion);
