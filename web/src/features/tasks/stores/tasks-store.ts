import type { Task, TaskCategory } from "@/features/tasks/types/task";
import { getCurrentTimestamp } from "@/utils/date";
import { create } from "zustand";
import { persist } from "zustand/middleware";

type TaskState = {
  tasks: Task[];
};

type TaskActions = {
  setTasks: (tasks: Task[]) => void;
  addTask: (
    task: string,
    description?: string,
    category?: TaskCategory,
  ) => void;
  removeTask: (id: string) => void;
  toggleTaskCompletion: (id: string, completed: boolean) => void;
  updateTask: (
    id: string,
    updates: Partial<Pick<Task, "title" | "description">>,
  ) => void;
};

export const useTasksStore = create<TaskState & TaskActions>()(
  persist(
    (set) => ({
      tasks: [],

      setTasks: (tasks: Task[]) => {
        set({ tasks });
      },

      addTask: (title, description, category = "uncategorised") => {
        const now = getCurrentTimestamp();
        set((state) => ({
          tasks: [
            {
              id: crypto.randomUUID(),
              title,
              description,
              category: category,
              isCompleted: false,
              isSelected: false,
              createdAt: now,
              updatedAt: now,
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
            t.id === id
              ? {
                  ...t,
                  isCompleted: completed,
                  updatedAt: getCurrentTimestamp(),
                }
              : t,
          ),
        }));
      },

      updateTask: (id, updates) => {
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === id
              ? { ...t, ...updates, updatedAt: getCurrentTimestamp() }
              : t,
          ),
        }));
      },
    }),
    {
      name: "tasks-storage",
      version: 2,
      migrate: (state, version) => {
        const persistedState = state as { tasks?: Task[] };
        if (version === 1) {
          const migratedTasks = (persistedState.tasks || []).map((task) => ({
            ...task,
            updatedAt: (task as any).updatedAt ?? task.createdAt,
          }));
          return { tasks: migratedTasks };
        }
        return persistedState as TaskState;
      },
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

export const useUpdateTask = () => useTasksStore((state) => state.updateTask);
