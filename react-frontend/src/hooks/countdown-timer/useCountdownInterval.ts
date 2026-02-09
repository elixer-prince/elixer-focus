import useCountdownAlerts from "@/hooks/countdown-timer/useCountdownAlerts";
import useEndTicking from "@/hooks/countdown-timer/useEndTicking";
import useSessionSwitch from "@/hooks/countdown-timer/useSessionSwitch";
import useCountdownContext from "@/hooks/countdown-timer/useCountdownContext.ts";
import { useSetRemainingTimeInSeconds } from "@/stores/countdown-timer/CountdownStore.ts";
import { useCurrentSessionType } from "@/stores/countdown-timer/SessionStore.ts";
import { calculateRemainingSeconds } from "@/utils/countdown-timer/calculations.ts";
import {
  timerHasEnded,
  timerIsAboutToEnd,
} from "@/utils/countdown-timer/checks.ts";
import usePageTitle from "@/hooks/usePageTitle";
import { getCurrentTimestamp } from "@/utils/date";
import { playSound } from "@/utils/sound";
import { useCallback } from "react";

const useRunInterval = () => {
  const { autoSwitchSessionType } = useSessionSwitch();
  const { startEndTicking, stopEndTicking } = useEndTicking();
  const { displayRemainingTimeInPageTitle } = usePageTitle();
  const { alertUserOfTimerEnd } = useCountdownAlerts();

  const { timerBeepSoundEffectRef, timerIntervalRef } = useCountdownContext();

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
          autoSwitchSessionType();
          // TODO: Implement timeElapsed here
        }
      }, 1000);
    },
    [
      currentSessionType,
      timerBeepSoundEffectRef,
      autoSwitchSessionType,
      startEndTicking,
      stopEndTicking,
      alertUserOfTimerEnd,
      displayRemainingTimeInPageTitle,
      clearIntervalIfItExists,
      setRemainingTimeInSeconds,
    ],
  );

  // * Locked * //
  const runInterval = useCallback(
    (endTime: number) => {
      clearIntervalIfItExists();
      timerIntervalRef.current = createNewInterval(endTime);
    },
    [timerIntervalRef, createNewInterval, clearIntervalIfItExists],
  );

  return { runInterval, clearIntervalIfItExists };
};

export default useRunInterval;
