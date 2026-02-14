import useCountdownContext from "@/hooks/countdown-timer/useCountdownContext";
import useCountdownInterval from "@/hooks/countdown-timer/useCountdownInterval";
import useEndTicking from "@/hooks/countdown-timer/useEndTicking";
import useSessionSwitch from "@/hooks/countdown-timer/useSessionSwitch";
import {
  useSetRemainingTimeInSeconds,
  useSetTimerPaused,
  useSetTimerRunning,
  useTimerPaused,
  useTimerRunning,
} from "@/stores/countdown-timer/countdown-store";
import { convertMillisecondsToSeconds } from "@/utils/conversion";
import { getCurrentTimestamp } from "@/utils/date";
import { saveToLocalStorage } from "@/utils/storage";
import { useCallback } from "react";

const useCountdownTimerHelpers = () => {
  const { clearIntervalIfItExists } = useCountdownInterval();
  const { autoSwitchSessionType } = useSessionSwitch();
  const { stopEndTicking } = useEndTicking();

  const timerRunning = useTimerRunning();
  const timerPaused = useTimerPaused();
  const setTimerRunning = useSetTimerRunning();
  const setTimerPaused = useSetTimerPaused();
  const setRemainingTimeInSeconds = useSetRemainingTimeInSeconds();

  const { timerEndTimeRef, isEndTickingRef } = useCountdownContext();

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
    autoSwitchSessionType();
    clearIntervalIfItExists();
    saveToLocalStorage("timerEndTime", null);
  }, [
    stopEndTicking,
    setRemainingTimeInSeconds,
    setTimerPaused,
    setTimerRunning,
    autoSwitchSessionType,
    clearIntervalIfItExists,
  ]);

  // * Locked * //
  const calculateNewRemainingSeconds = useCallback(
    (endTime: number): number => {
      if (!timerEndTimeRef.current) return 0;

      const now = getCurrentTimestamp();

      return Math.max(
        0,
        Math.round(convertMillisecondsToSeconds(endTime - now)),
      );
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
