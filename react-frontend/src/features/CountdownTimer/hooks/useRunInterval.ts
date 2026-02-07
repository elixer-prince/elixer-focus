import useEndTicking from "@/features/CountdownTimer/hooks/useEndTicking.ts";
import useSessionSwitch from "@/features/CountdownTimer/hooks/useSessionSwitch.ts";
import { useCountdownTimerContext } from "@/features/CountdownTimer/stores/CountdownTimerContext.tsx";
import { useSessionContext } from "@/features/CountdownTimer/stores/SessionContext.tsx";
import { calculateRemainingSeconds } from "@/features/CountdownTimer/utils/timerCalculations.ts";
import {
  timerHasEnded,
  timerIsAboutToEnd,
} from "@/features/CountdownTimer/utils/timerChecks.ts";
import { getCurrentTimestamp } from "@/utils/date.ts";
import { formatTimeInMinutesAndSeconds } from "@/utils/formatting";
import { playSound } from "@/utils/sound.ts";
import { saveToLocalStorage } from "@/utils/storage.ts";
import { useCallback } from "react";

const useRunInterval = (): {
  runInterval: (endTime: number) => void;
} => {
  const {
    timerBeepSoundEffectRef,
    timerIntervalRef,
    setRemainingTimeInSeconds,
  } = useCountdownTimerContext();
  const { currentSessionType } = useSessionContext();
  const { switchSessionType } = useSessionSwitch();
  const { startEndTicking, stopEndTicking } = useEndTicking();

  const alertUserOfTimerEnd = () => {
    setTimeout(() => {
      alert(`Your ${currentSessionType} session has ended!`);
    }, 1000);
  };

  const displayTimeInPageTitle = (remainingSeconds: number) => {
    const time = formatTimeInMinutesAndSeconds(remainingSeconds);
    let message;

    if (currentSessionType === "Focus") {
      message = "Time to focus!";
    } else {
      message = "Take a break!";
    }

    document.title = `${time} - ${message}`;
  };

  const clearIntervalIfItExists = useCallback(() => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
  }, [timerIntervalRef]);

  const createNewInterval = useCallback(
    (endTime: number) => {
      return setInterval(() => {
        const now = getCurrentTimestamp();
        const remainingSeconds = calculateRemainingSeconds(now, endTime);

        displayTimeInPageTitle(remainingSeconds);

        if (timerIsAboutToEnd(remainingSeconds)) startEndTicking();

        setRemainingTimeInSeconds(() => {
          saveToLocalStorage("remainingTimeInSeconds", remainingSeconds);
          return remainingSeconds;
        });

        if (timerHasEnded(remainingSeconds)) {
          clearIntervalIfItExists();
          stopEndTicking();
          playSound(timerBeepSoundEffectRef.current);
          alertUserOfTimerEnd();
          switchSessionType();
          document.title = "Elixer Focus";
        }
      }, 1000);
    },
    [
      timerBeepSoundEffectRef,
      switchSessionType,
      setRemainingTimeInSeconds,
      startEndTicking,
      stopEndTicking,
      alertUserOfTimerEnd,
      clearIntervalIfItExists,
    ],
  );

  const runInterval = useCallback(
    (endTime: number) => {
      clearIntervalIfItExists();
      timerIntervalRef.current = createNewInterval(endTime);
    },
    [timerIntervalRef, createNewInterval],
  );

  return { runInterval };
};

export default useRunInterval;
