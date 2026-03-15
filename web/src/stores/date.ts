import { create } from "zustand";
import dayjs from "dayjs";

type DateState = {
  currentTime: string;
  timeFormat: string;
};

type DateActions = {
  updateCurrentTime: () => void;
  setTimeFormat: (format: string) => void;
};

const defaultTimeFormat = "hh:mm:ss A";

const useDateStore = create<DateState & DateActions>((set) => ({
  currentTime: dayjs().format(defaultTimeFormat),
  timeFormat: defaultTimeFormat,

  updateCurrentTime: () =>
    set({ currentTime: dayjs().format(defaultTimeFormat) }),

  setTimeFormat: (format: string) => set({ timeFormat: format }),
}));

// State

export const useCurrentTime = () => useDateStore((state) => state.currentTime);

export const useTimeFormat = () => useDateStore((state) => state.timeFormat);

// Actions

export const useUpdateCurrentTime = () =>
  useDateStore((state) => state.updateCurrentTime);

export const useSetTimeFormat = () =>
  useDateStore((state) => state.setTimeFormat);
