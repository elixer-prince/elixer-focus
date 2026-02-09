import useCountdownInterval from "@/features/CountdownTimer/hooks/useCountdownInterval";
import useEndTicking from "@/features/CountdownTimer/hooks/useEndTicking";
import useSessionSwitch from "@/features/CountdownTimer/hooks/useSessionSwitch";
import { useCountdownTimerContext } from "@/features/CountdownTimer/stores/CountdownTimerContext";
import {
  useSetRemainingTimeInSeconds,
  useSetTimerPaused,
  useSetTimerRunning,
  useTimerPaused,
  useTimerRunning,
} from "@/features/CountdownTimer/stores/CountdownTimerStore";
import { convertMillisecondsToSeconds } from "@/utils/conversion";
import { getCurrentTimestamp } from "@/utils/date";
import { saveToLocalStorage } from "@/utils/storage";
import { useCallback } from "react";

const useCountdownTimerHelpers = () => {
  const { clearIntervalIfItExists } = useCountdownInterval();
  const { switchSessionType } = useSessionSwitch();
  const { stopEndTicking } = useEndTicking();

  const timerRunning = useTimerRunning();
  const timerPaused = useTimerPaused();
  const setTimerRunning = useSetTimerRunning();
  const setTimerPaused = useSetTimerPaused();
  const setRemainingTimeInSeconds = useSetRemainingTimeInSeconds();

  const { timerEndTimeRef, isEndTickingRef } = useCountdownTimerContext();

  // * Locked * //
  const timerShouldNotBeActiveOnRefresh = useCallback((): boolean => {
    return !timerRunning || timerPaused;
  }, [timerRunning, timerPaused]);

  // * Locked * //
  const timerShouldBeTickingOnRefresh = useCallback(
    (remainingSeconds: number): boolean => {
      return (
        remainingSeconds > 0 &&
        remainingSeconds <= 10 &&
        !isEndTickingRef.current
      );
    },
    [isEndTickingRef],
  );

  // * Locked * //
  const timerEndedWhileAway = useCallback(
    (remainingSeconds: number): boolean => {
      return remainingSeconds <= 0;
    },
    [],
  );

  // * Locked * //
  const handleEndedTimerWhileAway = useCallback(() => {
    stopEndTicking();
    setRemainingTimeInSeconds(0);
    setTimerPaused(true);
    setTimerRunning(false);
    switchSessionType();
    clearIntervalIfItExists();
    saveToLocalStorage("timerEndTime", null);
  }, []);

  // * Locked * //
  const calculateNewRemainingSeconds = useCallback(
    (endTime: number): number => {
      if (!timerEndTimeRef.current) return 0;

      const now = getCurrentTimestamp();

      const remainingSeconds = Math.max(
        0,
        Math.round(convertMillisecondsToSeconds(endTime - now)),
      );

      return remainingSeconds;
    },
    [timerEndTimeRef],
  );

  return {
    timerShouldNotBeActiveOnRefresh,
    timerShouldBeTickingOnRefresh,
    timerEndedWhileAway,
    handleEndedTimerWhileAway,
    calculateNewRemainingSeconds,
  };
};

export default useCountdownTimerHelpers;
