import useCountdownAlerts from "@/features/CountdownTimer/hooks/useCountdownAlerts";
import useEndTicking from "@/features/CountdownTimer/hooks/useEndTicking";
import useSessionSwitch from "@/features/CountdownTimer/hooks/useSessionSwitch";
import { useCountdownTimerContext } from "@/features/CountdownTimer/stores/CountdownTimerContext";
import { useSetRemainingTimeInSeconds } from "@/features/CountdownTimer/stores/CountdownTimerStore";
import { useCurrentSessionType } from "@/features/CountdownTimer/stores/SessionStore";
import { calculateRemainingSeconds } from "@/features/CountdownTimer/utils/timerCalculations";
import {
  timerHasEnded,
  timerIsAboutToEnd,
} from "@/features/CountdownTimer/utils/timerChecks";
import usePageTitle from "@/hooks/usePageTitle";
import { getCurrentTimestamp } from "@/utils/date";
import { playSound } from "@/utils/sound";
import { useCallback } from "react";

const useRunInterval = () => {
  const { switchSessionType } = useSessionSwitch();
  const { startEndTicking, stopEndTicking } = useEndTicking();
  const { displayRemainingTimeInPageTitle, resetPageTitle } = usePageTitle();
  const { alertUserOfTimerEnd } = useCountdownAlerts();

  const { timerBeepSoundEffectRef, timerIntervalRef } =
    useCountdownTimerContext();

  const currentSessionType = useCurrentSessionType();
  const setRemainingTimeInSeconds = useSetRemainingTimeInSeconds();

  // * Locked * //
  const clearIntervalIfItExists = useCallback(() => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
  }, [timerIntervalRef]);

  // * Temp Locked * //
  const createNewInterval = useCallback(
    (endTime: number) => {
      return setInterval(() => {
        const now = getCurrentTimestamp();
        const remainingSeconds = calculateRemainingSeconds(now, endTime);

        displayRemainingTimeInPageTitle(remainingSeconds, currentSessionType);

        if (timerIsAboutToEnd(remainingSeconds)) startEndTicking();

        setRemainingTimeInSeconds(remainingSeconds);

        if (timerHasEnded(remainingSeconds)) {
          clearIntervalIfItExists();
          stopEndTicking();
          playSound(timerBeepSoundEffectRef.current);
          alertUserOfTimerEnd();
          switchSessionType();
          resetPageTitle();
          // TODO: Implement timeElapsed here
        }
      }, 1000);
    },
    [
      timerBeepSoundEffectRef,
      switchSessionType,
      startEndTicking,
      stopEndTicking,
      alertUserOfTimerEnd,
      clearIntervalIfItExists,
    ],
  );

  // * Locked * //
  const runInterval = useCallback(
    (endTime: number) => {
      clearIntervalIfItExists();
      timerIntervalRef.current = createNewInterval(endTime);
    },
    [timerIntervalRef, createNewInterval],
  );

  return { runInterval, clearIntervalIfItExists };
};

export default useRunInterval;
