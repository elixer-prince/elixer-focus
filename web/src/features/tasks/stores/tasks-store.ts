import {
  createTaskStore,
  type Task,
  type TaskCategory,
  type TaskStore,
  type TaskUpdate,
} from "@elixer-focus/shared/tasks";
import {
  dispatchCalendarCommand,
  registerTaskStateHandler,
} from "@/features/calendar/services/calendar-coordinator";
import { getCurrentTimestamp } from "@/utils/date";
import { createPersistOptions } from "@/stores/persist-config";
import { useCallback } from "react";
import { useStore } from "zustand";

const taskStore = createTaskStore({
  idGenerator: () => crypto.randomUUID(),
  getCurrentTimestamp,
  persistOptions: createPersistOptions<TaskStore>({
    name: "tasks-storage",
    version: 5,
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
            ...(task.isCompleted && (completedAt !== undefined || version <= 2)
              ? {
                  completedAt: completedAt ?? task.updatedAt ?? task.createdAt,
                }
              : {}),
          };
        });
        return { tasks: migratedTasks } as TaskStore;
      }
      return persistedState as TaskStore;
    },
  }),
});

export const useTasksStore = Object.assign(
  <T>(selector: (state: TaskStore) => T) => useStore(taskStore, selector),
  taskStore,
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
    (id: string, updates: TaskUpdate) =>
      dispatchCalendarCommand({ type: "update-task", taskId: id, updates }),
    [],
  );
