import useCountdownTimerContext from "@/features/countdown-timer/hooks/useCountdownContext";
import {
  useSetRemainingTimeInSeconds,
  useSetStartTimeInMinutes,
  useSetTimerPaused,
  useSetTimerRunning,
  useClearTimerRun,
  useResetSessionProgressInSeconds,
} from "@/features/countdown-timer/stores/countdown-store";
import { useStartIdleInterval } from "@/features/countdown-timer/stores/session-history-store";
import { convertMinutesToSeconds } from "@/utils/conversion";
import { saveToLocalStorage } from "@/utils/storage";

const UseCountdownStorage = () => {
  const { timerIntervalRef, timerEndTimeRef } = useCountdownTimerContext();

  const setTimerRunning = useSetTimerRunning();
  const setTimerPaused = useSetTimerPaused();
  const setStartTimeInMinutes = useSetStartTimeInMinutes();
  const setRemainingTimeInSeconds = useSetRemainingTimeInSeconds();
  const clearTimerRun = useClearTimerRun();
  const resetSessionProgressInSeconds = useResetSessionProgressInSeconds();
  const startIdleInterval = useStartIdleInterval();

  // * Locked * //
  const resetTimerStorage = (newStartTime: number, startIdle = true) => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }

    setTimerRunning(false);
    setTimerPaused(true);
    clearTimerRun();
    resetSessionProgressInSeconds();

    timerEndTimeRef.current = null;
    saveToLocalStorage("timerEndTime", null);
    saveToLocalStorage("timerPausedRemainingTime", null);

    setStartTimeInMinutes(newStartTime);
    setRemainingTimeInSeconds(convertMinutesToSeconds(newStartTime));
    if (startIdle) startIdleInterval(Date.now());
  };

  return { resetTimerStorage };
};

export default UseCountdownStorage;
