import useCountdownAlerts from "@/features/countdown-timer/hooks/useCountdownAlerts";
import useCountdownContext from "@/features/countdown-timer/hooks/useCountdownContext";
import useEndTicking from "@/features/countdown-timer/hooks/useEndTicking";
import useSessionSwitch from "@/features/countdown-timer/hooks/useSessionSwitch";
import {
  broadcastTimerState,
  isTimerCoordinatorOwner,
} from "@/features/countdown-timer/services/timer-coordinator";
import {
  useActiveRunDurationInSeconds,
  useResetSessionProgressInSeconds,
  useSetSessionProgressInSeconds,
  useSetRemainingTimeInSeconds,
  useSessionProgressInSeconds,
  useTimerRunId,
} from "@/features/countdown-timer/stores/countdown-store";
import {
  useCurrentSessionType,
  useAttributeSessionOverrun,
  useSetPreviousSessionType,
} from "@/features/countdown-timer/stores/session-store";
import { useCompleteSession } from "@/features/countdown-timer/stores/session-history-store";
import { calculateRemainingSeconds } from "@/features/countdown-timer/utils/calculations";
import {
  timerHasEnded,
  timerIsAboutToEnd,
} from "@/features/countdown-timer/utils/checks";
import usePageTitle from "@/hooks/usePageTitle";
import { getCurrentTimestamp } from "@/utils/date";
import { clearIntervalIfItExists } from "@/utils/interval";
import { playSound } from "@/utils/sound";
import { useCallback } from "react";

const useCountdownInterval = () => {
  const { autoSwitchSessionType } = useSessionSwitch();
  const { startEndTicking, stopEndTicking } = useEndTicking();
  const { displayRemainingTimeInPageTitle } = usePageTitle();
  const { alertUserOfTimerEnd } = useCountdownAlerts();

  const {
    timerBeepSoundEffectRef,
    hasPlayedEndBeepRef,
    timerIntervalRef,
    sessionProgressIntervalRef,
  } = useCountdownContext();

  const currentSessionType = useCurrentSessionType();
  const setPreviousSessionType = useSetPreviousSessionType();
  const attributeSessionOverrun = useAttributeSessionOverrun();
  const setSessionProgressInSeconds = useSetSessionProgressInSeconds();
  const resetSessionProgressInSeconds = useResetSessionProgressInSeconds();
  const sessionProgressInSeconds = useSessionProgressInSeconds();
  const completeSession = useCompleteSession();
  const timerRunId = useTimerRunId();
  const activeRunDurationInSeconds = useActiveRunDurationInSeconds();

  const setRemainingTimeInSeconds = useSetRemainingTimeInSeconds();

  const resetSessionProgress = useCallback(() => {
    clearIntervalIfItExists(sessionProgressIntervalRef);
    resetSessionProgressInSeconds();
  }, [sessionProgressIntervalRef, resetSessionProgressInSeconds]);

  const createSessionProgressInterval = useCallback(() => {
    if (sessionProgressIntervalRef.current) return;

    const startTime = getCurrentTimestamp();

    sessionProgressIntervalRef.current = setInterval(() => {
      const now = getCurrentTimestamp();
      const progressSeconds = Math.floor((now - startTime) / 1000);
      setSessionProgressInSeconds(progressSeconds);
    }, 100);
  }, [setSessionProgressInSeconds, sessionProgressIntervalRef]);

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
          if (!isTimerCoordinatorOwner()) return;

          if (!hasPlayedEndBeepRef.current) {
            hasPlayedEndBeepRef.current = true;
            playSound(timerBeepSoundEffectRef.current);
          }
          setPreviousSessionType(currentSessionType);
          completeSession(
            currentSessionType,
            activeRunDurationInSeconds ?? sessionProgressInSeconds,
            endTime,
            timerRunId ?? crypto.randomUUID(),
            attributeSessionOverrun,
          );
          alertUserOfTimerEnd(currentSessionType);
          autoSwitchSessionType();
          resetSessionProgress();
          broadcastTimerState();
        }
      }, 100);
    },
    [
      currentSessionType,
      attributeSessionOverrun,
      activeRunDurationInSeconds,
      timerRunId,
      sessionProgressInSeconds,
      timerBeepSoundEffectRef,
      hasPlayedEndBeepRef,
      timerIntervalRef,
      completeSession,
      autoSwitchSessionType,
      startEndTicking,
      stopEndTicking,
      resetSessionProgress,
      alertUserOfTimerEnd,
      displayRemainingTimeInPageTitle,
      setRemainingTimeInSeconds,
      setPreviousSessionType,
    ],
  );

  const runInterval = useCallback(
    (endTime: number) => {
      clearIntervalIfItExists(timerIntervalRef);
      timerIntervalRef.current = createNewInterval(endTime);
      createSessionProgressInterval();
    },
    [timerIntervalRef, createNewInterval, createSessionProgressInterval],
  );

  return { runInterval, resetSessionProgress };
};

export default useCountdownInterval;
