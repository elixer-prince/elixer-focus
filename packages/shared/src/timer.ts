import type { StateCreator } from "zustand";

export type TimerSettings = {
  focusDuration: number;
  shortBreakDuration: number;
  longBreakDuration: number;
  sessionCountLimit: number;
  attributeSessionOverrun: boolean;
};

export type TimerSettingsActions = {
  setFocusDuration: (duration: number) => void;
  setShortBreakDuration: (duration: number) => void;
  setLongBreakDuration: (duration: number) => void;
  setSessionCountLimit: (limit: number) => void;
  setAttributeSessionOverrun: (enabled: boolean) => void;
};

export type TimerSettingsSlice = TimerSettings & TimerSettingsActions;

export const defaultTimerSettings: TimerSettings = {
  focusDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  sessionCountLimit: 4,
  attributeSessionOverrun: true,
};

export const isValidTimerDuration = (duration: number) =>
  Number.isFinite(duration) && duration >= 1;

export const isValidSessionCountLimit = (limit: number) =>
  Number.isInteger(limit) && limit >= 1 && limit <= 8;

export const createTimerSettingsSlice =
  <T extends TimerSettingsSlice>(): StateCreator<
    T,
    [],
    [],
    TimerSettingsSlice
  > =>
  (set) => ({
    ...defaultTimerSettings,
    setFocusDuration: (focusDuration) => {
      if (isValidTimerDuration(focusDuration))
        set({ focusDuration } as Partial<T>);
    },
    setShortBreakDuration: (shortBreakDuration) => {
      if (isValidTimerDuration(shortBreakDuration)) {
        set({ shortBreakDuration } as Partial<T>);
      }
    },
    setLongBreakDuration: (longBreakDuration) => {
      if (isValidTimerDuration(longBreakDuration)) {
        set({ longBreakDuration } as Partial<T>);
      }
    },
    setSessionCountLimit: (sessionCountLimit) => {
      if (isValidSessionCountLimit(sessionCountLimit)) {
        set({ sessionCountLimit } as Partial<T>);
      }
    },
    setAttributeSessionOverrun: (attributeSessionOverrun) =>
      set({ attributeSessionOverrun } as Partial<T>),
  });
