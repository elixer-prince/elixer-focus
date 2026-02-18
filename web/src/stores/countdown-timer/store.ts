import { convertMinutesToSeconds } from "@/utils/conversion";
import { create } from "zustand";
import { persist } from "zustand/middleware";

type CountdownTimerState = {
  timerRunning: boolean;
  timerPaused: boolean;
  remainingTimeInSeconds: number;
  startTimeInMinutes: number;
  elapsedTimeInSeconds: number;
};

type CountdownTimerActions = {
  setTimerRunning: (timerRunning: boolean) => void;
  setTimerPaused: (timerPaused: boolean) => void;
  setRemainingTimeInSeconds: (remainingSeconds: number) => void;
  setStartTimeInMinutes: (startTimeInMinutes: number) => void;
  incrementElapsedTimeInSeconds: () => void;
  resetElapsedTimeInSeconds: () => void;
};

type CountdownTimerStore = CountdownTimerState & CountdownTimerActions;

const useCountdownTimerStore = create<CountdownTimerStore>()(
  persist(
    (set) => ({
      timerRunning: false,
      timerPaused: true,
      remainingTimeInSeconds: convertMinutesToSeconds(25),
      startTimeInMinutes: 25,
      elapsedTimeInSeconds: 0,

      setTimerRunning: (timerRunning: boolean) => set({ timerRunning }),

      setTimerPaused: (timerPaused: boolean) => set({ timerPaused }),

      setRemainingTimeInSeconds: (remainingSeconds: number) =>
        set({ remainingTimeInSeconds: remainingSeconds }),

      setStartTimeInMinutes: (startTimeInMinutes: number) =>
        set({ startTimeInMinutes }),

      incrementElapsedTimeInSeconds: () =>
        set((state) => ({
          elapsedTimeInSeconds: state.elapsedTimeInSeconds + 1,
        })),

      resetElapsedTimeInSeconds: () => set({ elapsedTimeInSeconds: 0 }),
    }),
    { name: "countdown-timer-storage" },
  ),
);

/*-------------------------------------
| COUNTDOWN TIMER - STORE EXPORTS
|--------------------------------------
|
*/

// STATES

export const useTimerRunning = () =>
  useCountdownTimerStore((state) => state.timerRunning);

export const useTimerPaused = () =>
  useCountdownTimerStore((state) => state.timerPaused);

export const useRemainingTimeInSeconds = () =>
  useCountdownTimerStore((state) => state.remainingTimeInSeconds);

export const useStartTimeInMinutes = () =>
  useCountdownTimerStore((state) => state.startTimeInMinutes);

export const useElapsedTimeInSeconds = () =>
  useCountdownTimerStore((state) => state.elapsedTimeInSeconds);

// ACTIONS

export const useSetTimerRunning = () =>
  useCountdownTimerStore((state) => state.setTimerRunning);

export const useSetTimerPaused = () =>
  useCountdownTimerStore((state) => state.setTimerPaused);

export const useSetRemainingTimeInSeconds = () =>
  useCountdownTimerStore((state) => state.setRemainingTimeInSeconds);

export const useSetStartTimeInMinutes = () =>
  useCountdownTimerStore((state) => state.setStartTimeInMinutes);

export const useIncrementElapsedTimeInSeconds = () =>
  useCountdownTimerStore((state) => state.incrementElapsedTimeInSeconds);

export const useResetElapsedTimeInSeconds = () =>
  useCountdownTimerStore((state) => state.resetElapsedTimeInSeconds);
