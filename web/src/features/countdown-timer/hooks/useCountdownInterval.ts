import useCountdownAlerts from "@/features/countdown-timer/hooks/useCountdownAlerts";
import useCountdownContext from "@/features/countdown-timer/hooks/useCountdownContext";
import useEndTicking from "@/features/countdown-timer/hooks/useEndTicking";
import useSessionSwitch from "@/features/countdown-timer/hooks/useSessionSwitch";
import { calculateRemainingSeconds } from "@/features/countdown-timer/utils/calculations";
import {
  timerHasEnded,
  timerIsAboutToEnd,
} from "@/features/countdown-timer/utils/checks";
import usePageTitle from "@/hooks/usePageTitle";
import {
  useCurrentSessionType,
  useSetPreviousSessionType,
} from "@/features/countdown-timer/stores/session-store";
import {
  useResetElapsedTimeInSeconds,
  useSetElapsedTimeInSeconds,
  useSetRemainingTimeInSeconds,
} from "@/features/countdown-timer/stores/countdown-store";
import { getCurrentTimestamp } from "@/utils/date";
import { clearIntervalIfItExists } from "@/utils/interval";
import { playSound } from "@/utils/sound";
import { useCallback } from "react";

const useCountdownInterval = () => {
  const { autoSwitchSessionType } = useSessionSwitch();
  const { startEndTicking, stopEndTicking } = useEndTicking();
  const { displayRemainingTimeInPageTitle } = usePageTitle();
  const { alertUserOfTimerEnd } = useCountdownAlerts();

  const { timerBeepSoundEffectRef, timerIntervalRef, elapsedIntervalRef } =
    useCountdownContext();

  const currentSessionType = useCurrentSessionType();
  const setPreviousSessionType = useSetPreviousSessionType();
  const setElapsedTimeInSeconds = useSetElapsedTimeInSeconds();
  const resetElapsedTimeInSeconds = useResetElapsedTimeInSeconds();

  const setRemainingTimeInSeconds = useSetRemainingTimeInSeconds();

  const resetElapsedTime = useCallback(() => {
    clearIntervalIfItExists(elapsedIntervalRef);
    resetElapsedTimeInSeconds();
  }, [elapsedIntervalRef, resetElapsedTimeInSeconds]);

  const createElapsedInterval = useCallback(() => {
    if (elapsedIntervalRef.current) return;

    const startTime = getCurrentTimestamp();

    elapsedIntervalRef.current = setInterval(() => {
      const now = getCurrentTimestamp();
      const elapsedSeconds = Math.floor((now - startTime) / 1000);
      setElapsedTimeInSeconds(elapsedSeconds);
    }, 1000);
  }, [setElapsedTimeInSeconds, elapsedIntervalRef]);

  const createNewInterval = useCallback(
    (endTime: number) => {
      return setInterval(() => {
        const now = getCurrentTimestamp();
        const remainingSeconds = calculateRemainingSeconds(now, endTime);

        displayRemainingTimeInPageTitle(remainingSeconds, currentSessionType);

        if (timerIsAboutToEnd(remainingSeconds)) startEndTicking();

        setRemainingTimeInSeconds(remainingSeconds);

        if (timerHasEnded(remainingSeconds)) {
          clearIntervalIfItExists(timerIntervalRef);
          stopEndTicking();
          playSound(timerBeepSoundEffectRef.current);
          setPreviousSessionType(currentSessionType);
          alertUserOfTimerEnd();
          autoSwitchSessionType();
          resetElapsedTime();
          createElapsedInterval();
        }
      }, 1000);
    },
    [
      currentSessionType,
      timerBeepSoundEffectRef,
      timerIntervalRef,
      autoSwitchSessionType,
      startEndTicking,
      stopEndTicking,
      resetElapsedTime,
      alertUserOfTimerEnd,
      displayRemainingTimeInPageTitle,
      setRemainingTimeInSeconds,
      setPreviousSessionType,
      createElapsedInterval,
    ],
  );

  const runInterval = useCallback(
    (endTime: number) => {
      clearIntervalIfItExists(timerIntervalRef);
      timerIntervalRef.current = createNewInterval(endTime);
    },
    [timerIntervalRef, createNewInterval],
  );

  return { runInterval, resetElapsedTime };
};

export default useCountdownInterval;
