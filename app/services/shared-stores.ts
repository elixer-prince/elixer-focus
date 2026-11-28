import * as Crypto from "expo-crypto";
import {
  createSubtaskStore,
  createTaskStore,
} from "@elixer-focus/shared/tasks";
import {
  createTimerSettingsSlice,
  type TimerSettingsSlice,
} from "@elixer-focus/shared/timer";
import { getCurrentTimestamp } from "@elixer-focus/shared/utils";
import { createStore } from "zustand/vanilla";

export const tasksStore = createTaskStore({
  idGenerator: () => Crypto.randomUUID(),
  getCurrentTimestamp,
});

export const subtasksStore = createSubtaskStore({
  idGenerator: () => Crypto.randomUUID(),
  getCurrentTimestamp,
  getTasks: () => tasksStore.getState().tasks,
});

export const timerSettingsStore = createStore<TimerSettingsSlice>()(
  createTimerSettingsSlice<TimerSettingsSlice>(),
);
