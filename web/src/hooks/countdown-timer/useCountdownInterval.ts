import useCountdownAlerts from "@/hooks/countdown-timer/useCountdownAlerts";
import useCountdownContext from "@/hooks/countdown-timer/useCountdownContext";
import useEndTicking from "@/hooks/countdown-timer/useEndTicking";
import useSessionSwitch from "@/hooks/countdown-timer/useSessionSwitch";
import usePageTitle from "@/hooks/usePageTitle";
import {
  useCurrentSessionType,
  useSetPreviousSessionType,
} from "@/stores/countdown-timer/session-store";
import {
  useIncrementElapsedTimeInSeconds,
  useResetElapsedTimeInSeconds,
  useSetRemainingTimeInSeconds,
} from "@/stores/countdown-timer/store";
import { calculateRemainingSeconds } from "@/utils/countdown-timer/calculations";
import {
  timerHasEnded,
  timerIsAboutToEnd,
} from "@/utils/countdown-timer/checks";
import { getCurrentTimestamp } from "@/utils/date";
import { clearIntervalIfItExists } from "@/utils/interval";
import { playSound } from "@/utils/sound";
import { useCallback } from "react";

const useRunInterval = () => {
  const { autoSwitchSessionType } = useSessionSwitch();
  const { startEndTicking, stopEndTicking } = useEndTicking();
  const { displayRemainingTimeInPageTitle } = usePageTitle();
  const { alertUserOfTimerEnd } = useCountdownAlerts();

  const { timerBeepSoundEffectRef, timerIntervalRef, elapsedIntervalRef } =
    useCountdownContext();

  const currentSessionType = useCurrentSessionType();
  const setPreviousSessionType = useSetPreviousSessionType();
  const incrementElapsedTimeInSeconds = useIncrementElapsedTimeInSeconds();
  const resetElapsedTimeInSeconds = useResetElapsedTimeInSeconds();

  const setRemainingTimeInSeconds = useSetRemainingTimeInSeconds();

  const resetElapsedTime = useCallback(() => {
    clearIntervalIfItExists(elapsedIntervalRef);
    resetElapsedTimeInSeconds();
  }, [elapsedIntervalRef, resetElapsedTimeInSeconds]);

  const createElapsedInterval = useCallback(() => {
    if (elapsedIntervalRef.current) return;

    elapsedIntervalRef.current = setInterval(() => {
      incrementElapsedTimeInSeconds();
    }, 1000);
  }, [incrementElapsedTimeInSeconds, elapsedIntervalRef]);

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

export default useRunInterval;
