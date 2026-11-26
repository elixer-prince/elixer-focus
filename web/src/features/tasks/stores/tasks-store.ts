import type { Task, TaskCategory } from "@/features/tasks/types/task";
import {
  dispatchCalendarCommand,
  registerTaskStateHandler,
} from "@/features/calendar/services/calendar-coordinator";
import { getCurrentTimestamp } from "@/utils/date";
import { createPersistOptions, persist } from "@/stores/persist-config";
import { useCallback } from "react";
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
    defaultDurationMinutes?: number,
  ) => void;
  removeTask: (id: string) => void;
  toggleTaskCompletion: (id: string, completed: boolean) => void;
  updateTask: (
    id: string,
    updates: Partial<
      Pick<Task, "title" | "description" | "defaultDurationMinutes">
    >,
  ) => void;
};

export const useTasksStore = create<TaskState & TaskActions>()(
  persist(
    immer((set) => ({
      tasks: [],

      setTasks: (tasks: Task[]) => {
        set({ tasks });
      },

      addTask: (
        title,
        description,
        category = "uncategorised",
        defaultDurationMinutes = 30,
      ) => {
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
            defaultDurationMinutes,
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
            const now = getCurrentTimestamp();
            if (completed && !task.isCompleted) {
              task.completedAt = now;
            } else if (!completed) {
              delete task.completedAt;
            }
            task.isCompleted = completed;
            task.updatedAt = now;
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
      version: 4,
      migrate: (state, version) => {
        const persistedState = state as { tasks?: Task[] };
        if (version <= 3) {
          const migratedTasks = (persistedState.tasks || []).map((task) => {
            const { completedAt, ...taskWithoutCompletionTime } = task;

            return {
              ...taskWithoutCompletionTime,
              updatedAt:
                version === 1
                  ? (task.updatedAt ?? task.createdAt)
                  : task.updatedAt,
              defaultDurationMinutes: task.defaultDurationMinutes ?? 30,
              ...(task.isCompleted &&
              (completedAt !== undefined || version <= 2)
                ? {
                    completedAt:
                      completedAt ?? task.updatedAt ?? task.createdAt,
                  }
                : {}),
            };
          });
          return { tasks: migratedTasks } as TaskState & TaskActions;
        }
        return persistedState as TaskState & TaskActions;
      },
    }),
  ),
);

registerTaskStateHandler({
  apply: (tasks) => useTasksStore.setState({ tasks }),
  get: () => useTasksStore.getState().tasks,
  rehydrate: async () => {
    await useTasksStore.persist.rehydrate();
  },
});

// States

export const useTasks = () => useTasksStore((state) => state.tasks);

// Actions

export const useSetTasks = () =>
  useCallback(
    (tasks: Task[]) => dispatchCalendarCommand({ type: "set-tasks", tasks }),
    [],
  );

export const useReorderTasks = () =>
  useCallback(
    (tasks: Task[]) =>
      dispatchCalendarCommand({ type: "reorder-tasks", tasks }),
    [],
  );

export const useAddTask = () =>
  useCallback(
    (task: string, description?: string, category?: TaskCategory) =>
      dispatchCalendarCommand({
        type: "add-task",
        title: task,
        description,
        category,
      }),
    [],
  );

export const useRemoveTask = () =>
  useCallback(
    (id: string) =>
      dispatchCalendarCommand({ type: "remove-task", taskId: id }),
    [],
  );

export const useToggleTaskCompletion = () =>
  useCallback(
    (id: string, completed: boolean) =>
      dispatchCalendarCommand({
        type: "toggle-task-completion",
        taskId: id,
        completed,
      }),
    [],
  );

export const useUpdateTask = () =>
  useCallback(
    (
      id: string,
      updates: Partial<
        Pick<Task, "title" | "description" | "defaultDurationMinutes">
      >,
    ) => dispatchCalendarCommand({ type: "update-task", taskId: id, updates }),
    [],
  );
