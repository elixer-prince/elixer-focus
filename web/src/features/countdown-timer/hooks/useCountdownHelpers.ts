import useCountdownContext from "@/features/countdown-timer/hooks/useCountdownContext";
import useEndTicking from "@/features/countdown-timer/hooks/useEndTicking";
import useSessionSwitch from "@/features/countdown-timer/hooks/useSessionSwitch";
import {
  useSetRemainingTimeInSeconds,
  useSetTimerPaused,
  useSetTimerRunning,
  useTimerPaused,
  useTimerRunning,
} from "@/features/countdown-timer/stores/countdown-store";
import { convertMillisecondsToSeconds } from "@/utils/conversion";
import { getCurrentTimestamp } from "@/utils/date";
import { clearIntervalIfItExists } from "@/utils/interval";
import { saveToLocalStorage } from "@/utils/storage";
import { useCallback } from "react";

const useCountdownTimerHelpers = () => {
  const { autoSwitchSessionType } = useSessionSwitch();
  const { stopEndTicking } = useEndTicking();

  const timerRunning = useTimerRunning();
  const timerPaused = useTimerPaused();
  const setTimerRunning = useSetTimerRunning();
  const setTimerPaused = useSetTimerPaused();
  const setRemainingTimeInSeconds = useSetRemainingTimeInSeconds();

  const { timerEndTimeRef, timerIntervalRef, isEndTickingRef } =
    useCountdownContext();

  const timerShouldNotBeActiveOnRefresh = useCallback((): boolean => {
    return !timerRunning || timerPaused;
  }, [timerRunning, timerPaused]);

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

  const timerEndedWhileAway = useCallback(
    (remainingSeconds: number): boolean => {
      return remainingSeconds <= 0;
    },
    [],
  );

  const handleEndedTimerWhileAway = useCallback(() => {
    stopEndTicking();
    setRemainingTimeInSeconds(0);
    setTimerPaused(true);
    setTimerRunning(false);
    autoSwitchSessionType();
    clearIntervalIfItExists(timerIntervalRef);
    saveToLocalStorage("timerEndTime", null);
  }, [
    timerIntervalRef,
    stopEndTicking,
    setRemainingTimeInSeconds,
    setTimerPaused,
    setTimerRunning,
    autoSwitchSessionType,
  ]);

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
