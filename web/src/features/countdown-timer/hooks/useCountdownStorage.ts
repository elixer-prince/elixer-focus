import useCountdownTimerContext from "@/features/countdown-timer/hooks/useCountdownContext";
import {
  useSetRemainingTimeInSeconds,
  useSetStartTimeInMinutes,
  useSetTimerPaused,
  useSetTimerRunning,
} from "@/features/countdown-timer/stores/countdown-store";
import { convertMinutesToSeconds } from "@/utils/conversion";
import { saveToLocalStorage } from "@/utils/storage";

const UseCountdownStorage = () => {
  const { timerIntervalRef, timerEndTimeRef } = useCountdownTimerContext();

  const setTimerRunning = useSetTimerRunning();
  const setTimerPaused = useSetTimerPaused();
  const setStartTimeInMinutes = useSetStartTimeInMinutes();
  const setRemainingTimeInSeconds = useSetRemainingTimeInSeconds();

  // * Locked * //
  const resetTimerStorage = (newStartTime: number) => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }

    setTimerRunning(false);
    setTimerPaused(true);

    timerEndTimeRef.current = null;
    saveToLocalStorage("timerEndTime", null);

    setStartTimeInMinutes(newStartTime);
    setRemainingTimeInSeconds(convertMinutesToSeconds(newStartTime));
  };

  return { resetTimerStorage };
};

export default UseCountdownStorage;
