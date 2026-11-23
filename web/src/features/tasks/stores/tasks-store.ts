import type { Task, TaskCategory } from "@/features/tasks/types/task";
import { getCurrentTimestamp } from "@/utils/date";
import { createPersistOptions, persist } from "@/stores/persist-config";
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

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
    immer((set) => ({
      tasks: [],

      setTasks: (tasks: Task[]) => {
        set({ tasks });
      },

      addTask: (title, description, category = "uncategorised") => {
        const now = getCurrentTimestamp();
        set((state) => {
          state.tasks.unshift({
            id: crypto.randomUUID(),
            title,
            description,
            category: category,
            isCompleted: false,
            isSelected: false,
            createdAt: now,
            updatedAt: now,
          });
        });
      },

      removeTask: (id) => {
        set((state) => {
          state.tasks = state.tasks.filter((task) => task.id !== id);
        });
      },
      toggleTaskCompletion: (id, completed) => {
        set((state) => {
          const task = state.tasks.find((t) => t.id === id);
          if (task) {
            task.isCompleted = completed;
            task.updatedAt = getCurrentTimestamp();
          }
        });
      },

      updateTask: (id, updates) => {
        set((state) => {
          const task = state.tasks.find((t) => t.id === id);
          if (task) {
            Object.assign(task, updates);
            task.updatedAt = getCurrentTimestamp();
          }
        });
      },
    })),
    createPersistOptions<TaskState & TaskActions>({
      name: "tasks-storage",
      version: 2,
      migrate: (state, version) => {
        const persistedState = state as { tasks?: Task[] };
        if (version === 1) {
          const migratedTasks = (persistedState.tasks || []).map((task) => ({
            ...task,
            updatedAt: (task as any).updatedAt ?? task.createdAt,
          }));
          return { tasks: migratedTasks } as TaskState & TaskActions;
        }
        return persistedState as TaskState & TaskActions;
      },
    }),
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
