import type { Subtask } from "@/features/tasks/types/subtask";
import {
  dispatchCalendarCommand,
  registerSubtaskStateHandler as registerCoordinatorSubtaskStateHandler,
} from "@/features/calendar/services/calendar-coordinator";
import { createPersistOptions, persist } from "@/stores/persist-config";
import { useCallback } from "react";
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

type SubtaskState = {
  subtasks: Subtask[];
};

type SubtaskActions = {
  setSubtasks: (subtasks: Subtask[]) => void;
};

export const useSubtasksStore = create<SubtaskState & SubtaskActions>()(
  persist(
    immer((set) => ({
      subtasks: [],
      setSubtasks: (subtasks) => set({ subtasks }),
    })),
    createPersistOptions<SubtaskState & SubtaskActions>({
      name: "subtasks-storage",
      version: 1,
      partialize: (state) => ({ subtasks: state.subtasks }),
      migrate: (state) => {
        const persistedState = state as { subtasks?: unknown };
        return {
          subtasks: Array.isArray(persistedState.subtasks)
            ? (persistedState.subtasks as Subtask[])
            : [],
        } as SubtaskState & SubtaskActions;
      },
    }),
  ),
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
