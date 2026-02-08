import { create } from "zustand";

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

const useCountdownTimerContext = create<CountdownTimerStore>((set) => ({
  timerRunning: false,
  timerPaused: true,
  remainingTimeInSeconds: 0,
  startTimeInMinutes: 0,

  setTimerRunning: (timerRunning: boolean) => set({ timerRunning }),

  setTimerPaused: (timerPaused: boolean) => set({ timerPaused }),

  setRemainingTimeInSeconds: (remainingSeconds: number) =>
    set({ remainingTimeInSeconds: remainingSeconds }),

  setStartTimeInMinutes: (startTimeInMinutes: number) =>
    set({ startTimeInMinutes }),
}));

/*-------------------------------------
| COUNTDOWN TIMER - STORE EXPORTS
|--------------------------------------
|
*/

// STATES

export const useTimerRunning = () =>
  useCountdownTimerContext((state) => state.timerRunning);

export const useTimerPaused = () =>
  useCountdownTimerContext((state) => state.timerPaused);

export const useRemainingTimeInSeconds = () =>
  useCountdownTimerContext((state) => state.remainingTimeInSeconds);

export const useStartTimeInMinutes = () =>
  useCountdownTimerContext((state) => state.startTimeInMinutes);

// ACTIONS

export const useSetTimerRunning = () =>
  useCountdownTimerContext((state) => state.setTimerRunning);

export const useSetTimerPaused = () =>
  useCountdownTimerContext((state) => state.setTimerPaused);

export const useSetRemainingTimeInSeconds = () =>
  useCountdownTimerContext((state) => state.setRemainingTimeInSeconds);

export const useSetStartTimeInMinutes = () =>
  useCountdownTimerContext((state) => state.setStartTimeInMinutes);
