import { convertMinutesToSeconds } from "@/utils/conversion";
import {
  createPersistOptions,
  persist,
  simpleMigrate,
} from "@/stores/persist-config";
import { create } from "zustand";

type CountdownTimerState = {
  timerRunning: boolean;
  timerPaused: boolean;
  remainingTimeInSeconds: number;
  startTimeInMinutes: number;
  sessionProgressInSeconds: number;
  timerRunId: string | null;
  activeRunDurationInSeconds: number | null;
};

type CountdownTimerActions = {
  setTimerRunning: (timerRunning: boolean) => void;
  setTimerPaused: (timerPaused: boolean) => void;
  setRemainingTimeInSeconds: (remainingSeconds: number) => void;
  setStartTimeInMinutes: (startTimeInMinutes: number) => void;
  setSessionProgressInSeconds: (sessionProgressInSeconds: number) => void;
  resetSessionProgressInSeconds: () => void;
  setTimerRun: (id: string, durationInSeconds: number) => void;
  clearTimerRun: () => void;
};

type CountdownTimerStore = CountdownTimerState & CountdownTimerActions;

export const useCountdownTimerStore = create<CountdownTimerStore>()(
  persist(
    (set) => ({
      timerRunning: false,
      timerPaused: true,
      remainingTimeInSeconds: convertMinutesToSeconds(25),
      startTimeInMinutes: 25,
      sessionProgressInSeconds: 0,
      timerRunId: null,
      activeRunDurationInSeconds: null,

      setTimerRunning: (timerRunning: boolean) => set({ timerRunning }),

      setTimerPaused: (timerPaused: boolean) => set({ timerPaused }),

      setRemainingTimeInSeconds: (remainingSeconds: number) =>
        set({ remainingTimeInSeconds: remainingSeconds }),

      setStartTimeInMinutes: (startTimeInMinutes: number) =>
        set({ startTimeInMinutes }),

      setSessionProgressInSeconds: (sessionProgressInSeconds: number) =>
        set({
          sessionProgressInSeconds,
        }),

      resetSessionProgressInSeconds: () => set({ sessionProgressInSeconds: 0 }),

      setTimerRun: (timerRunId, activeRunDurationInSeconds) =>
        set({ timerRunId, activeRunDurationInSeconds }),

      clearTimerRun: () =>
        set({ timerRunId: null, activeRunDurationInSeconds: null }),
    }),
    createPersistOptions<CountdownTimerStore>({
      name: "countdown-timer-storage",
      version: 4,
      partialize: (state) => ({
        startTimeInMinutes: state.startTimeInMinutes,
        timerRunId: state.timerRunId,
        activeRunDurationInSeconds: state.activeRunDurationInSeconds,
      }),
      migrate: simpleMigrate<CountdownTimerStore>,
    }),
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

export const useSessionProgressInSeconds = () =>
  useCountdownTimerStore((state) => state.sessionProgressInSeconds);

export const useTimerRunId = () =>
  useCountdownTimerStore((state) => state.timerRunId);

export const useActiveRunDurationInSeconds = () =>
  useCountdownTimerStore((state) => state.activeRunDurationInSeconds);

// ACTIONS

export const useSetTimerRunning = () =>
  useCountdownTimerStore((state) => state.setTimerRunning);

export const useSetTimerPaused = () =>
  useCountdownTimerStore((state) => state.setTimerPaused);

export const useSetRemainingTimeInSeconds = () =>
  useCountdownTimerStore((state) => state.setRemainingTimeInSeconds);

export const useSetStartTimeInMinutes = () =>
  useCountdownTimerStore((state) => state.setStartTimeInMinutes);

export const useSetSessionProgressInSeconds = () =>
  useCountdownTimerStore((state) => state.setSessionProgressInSeconds);

export const useResetSessionProgressInSeconds = () =>
  useCountdownTimerStore((state) => state.resetSessionProgressInSeconds);

export const useSetTimerRun = () =>
  useCountdownTimerStore((state) => state.setTimerRun);

export const useClearTimerRun = () =>
  useCountdownTimerStore((state) => state.clearTimerRun);
