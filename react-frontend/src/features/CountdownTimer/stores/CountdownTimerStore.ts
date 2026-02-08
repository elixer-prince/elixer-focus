import { create } from "zustand";
import { persist } from "zustand/middleware";

type CountdownTimerState = {
  timerRunning: boolean;
  timerPaused: boolean;
  remainingTimeInSeconds: number;
  startTimeInMinutes: number;
};

type CountdownTimerActions = {
  setTimerRunning: (timerRunning: boolean) => void;
  setTimerPaused: (timerPaused: boolean) => void;
  setRemainingTimeInSeconds: (remainingSeconds: number) => void;
  setStartTimeInMinutes: (startTimeInMinutes: number) => void;
};

type CountdownTimerStore = CountdownTimerState & CountdownTimerActions;

const useCountdownTimerStore = create<CountdownTimerStore>()(
  persist(
    (set) => ({
      timerRunning: false,
      timerPaused: true,
      remainingTimeInSeconds: 0,
      startTimeInMinutes: 25,

      setTimerRunning: (timerRunning: boolean) => set({ timerRunning }),

      setTimerPaused: (timerPaused: boolean) => set({ timerPaused }),

      setRemainingTimeInSeconds: (remainingSeconds: number) =>
        set({ remainingTimeInSeconds: remainingSeconds }),

      setStartTimeInMinutes: (startTimeInMinutes: number) =>
        set({ startTimeInMinutes }),
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

// ACTIONS

export const useSetTimerRunning = () =>
  useCountdownTimerStore((state) => state.setTimerRunning);

export const useSetTimerPaused = () =>
  useCountdownTimerStore((state) => state.setTimerPaused);

export const useSetRemainingTimeInSeconds = () =>
  useCountdownTimerStore((state) => state.setRemainingTimeInSeconds);

export const useSetStartTimeInMinutes = () =>
  useCountdownTimerStore((state) => state.setStartTimeInMinutes);
