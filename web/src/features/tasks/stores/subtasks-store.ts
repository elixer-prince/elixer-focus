import {
  createSubtaskStore,
  type Subtask,
  type SubtaskStore,
} from "@elixer-focus/shared/tasks";
import {
  dispatchCalendarCommand,
  registerSubtaskStateHandler as registerCoordinatorSubtaskStateHandler,
} from "@/features/calendar/services/calendar-coordinator";
import { createPersistOptions } from "@/stores/persist-config";
import { getCurrentTimestamp } from "@/utils/date";
import { useTasksStore } from "@/features/tasks/stores/tasks-store";
import { useCallback } from "react";
import { create, useStore } from "zustand";

const subtasksStore = createSubtaskStore({
  idGenerator: () => crypto.randomUUID(),
  getCurrentTimestamp,
  getTasks: () => useTasksStore.getState().tasks,
  persistOptions: createPersistOptions<SubtaskStore>({
    name: "subtasks-storage",
    version: 1,
    partialize: (state) => ({ subtasks: state.subtasks }),
    migrate: (state) => {
      const persistedState = state as { subtasks?: unknown };
      return {
        subtasks: Array.isArray(persistedState.subtasks)
          ? (persistedState.subtasks as Subtask[])
          : [],
      } as SubtaskStore;
    },
  }),
});

export const useSubtasksStore = Object.assign(
  <T>(selector: (state: SubtaskStore) => T) =>
    useStore(subtasksStore, selector),
  subtasksStore,
);

export const useSubtaskCoordinatorStore = create<{
  supportsSubtasks: boolean | null;
}>()(() => ({ supportsSubtasks: null }));

export const useSubtasks = () => useSubtasksStore((state) => state.subtasks);

export const useSubtaskCount = (taskId: string) =>
  useSubtasksStore(
    (state) =>
      state.subtasks.filter((subtask) => subtask.taskId === taskId).length,
  );

export const useSubtaskCoordinatorSupport = () =>
  useSubtaskCoordinatorStore((state) => state.supportsSubtasks);

export const useAddSubtask = () =>
  useCallback(
    (taskId: string, parentSubtaskId: string | null, title: string) =>
      dispatchCalendarCommand({
        type: "add-subtask",
        taskId,
        parentSubtaskId,
        title,
      }),
    [],
  );

export const useUpdateSubtask = () =>
  useCallback(
    (subtaskId: string, title: string) =>
      dispatchCalendarCommand({ type: "update-subtask", subtaskId, title }),
    [],
  );

export const useToggleSubtaskCompletion = () =>
  useCallback(
    (subtaskId: string, completed: boolean) =>
      dispatchCalendarCommand({
        type: "toggle-subtask-completion",
        subtaskId,
        completed,
      }),
    [],
  );

export const useRemoveSubtask = () =>
  useCallback(
    (subtaskId: string) =>
      dispatchCalendarCommand({ type: "remove-subtask", subtaskId }),
    [],
  );

export const useReorderSubtasks = () =>
  useCallback(
    (subtaskId: string, targetSubtaskId: string | null, before: boolean) =>
      dispatchCalendarCommand({
        type: "reorder-subtasks",
        subtaskId,
        targetSubtaskId,
        before,
      }),
    [],
  );

registerCoordinatorSubtaskStateHandler({
  apply: (subtasks) => useSubtasksStore.getState().setSubtasks(subtasks),
  get: () => useSubtasksStore.getState().subtasks,
  rehydrate: async () => {
    await useSubtasksStore.persist.rehydrate();
  },
  setCoordinatorSupportsSubtasks: (supported) =>
    useSubtaskCoordinatorStore.setState({ supportsSubtasks: supported }),
});
