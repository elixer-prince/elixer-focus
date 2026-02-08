import useEndTicking from "@/features/CountdownTimer/hooks/useEndTicking";
import useRunInterval from "@/features/CountdownTimer/hooks/useRunInterval";
import useSessionSwitch from "@/features/CountdownTimer/hooks/useSessionSwitch";
import { useCountdownTimerContext } from "@/features/CountdownTimer/stores/CountdownTimerContext";
import {
  useRemainingTimeInSeconds,
  useSetRemainingTimeInSeconds,
  useSetTimerPaused,
  useSetTimerRunning,
  useTimerPaused,
  useTimerRunning,
} from "@/features/CountdownTimer/stores/CountdownTimerStore";
import { calculateEndTime } from "@/features/CountdownTimer/utils/timerCalculations";
import { getCurrentTimestamp } from "@/utils/date";
import { playSound } from "@/utils/sound";
import { saveToLocalStorage } from "@/utils/storage";
import { useCallback, useEffect } from "react";

const useStartCountdown = (): {
  startCountdown: () => void;
  startCountdownWithSound: () => void;
  startCountdownOnPageLoad: () => void;
} => {
  const {
    timerIntervalRef,
    timerOnClickSoundEffectRef,
    timerEndTimeRef,
    isEndTickingRef,
  } = useCountdownTimerContext();

  const timerRunning = useTimerRunning();
  const timerPaused = useTimerPaused();
  const remainingTimeInSeconds = useRemainingTimeInSeconds();
  const setTimerRunning = useSetTimerRunning();
  const setTimerPaused = useSetTimerPaused();
  const setRemainingTimeInSeconds = useSetRemainingTimeInSeconds();

  const { startEndTicking, stopEndTicking } = useEndTicking();
  const { runInterval } = useRunInterval();
  const { switchSessionType } = useSessionSwitch();

  /*------------------------------------------------------------
  |  Main Timer Start Functions
  |------------------------------------------------------------
  |
  */

  const startCountdown = useCallback(() => {
    stopEndTicking();
    setTimerPaused(false);
    setTimerRunning(true);

    const endTime = calculateEndTime(remainingTimeInSeconds);

    // Save the end time to local storage and as a reference
    timerEndTimeRef.current = endTime;
    saveToLocalStorage("timerEndTime", endTime);

    runInterval(endTime);
  }, [runInterval, timerEndTimeRef, stopEndTicking]);

  // Resume based on stored endTime
  const startCountdownOnPageLoad = useCallback(() => {
    // Only resume if it *should* be running
    if (!timerRunning || timerPaused) return;

    // Clear any existing interval before creating a new one
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }

    if (!timerEndTimeRef.current) {
      // Fallback if for some reason endTime wasn't stored
      startCountdown();
      return;
    }

    const now = getCurrentTimestamp();
    const endTime = timerEndTimeRef.current;

    const remainingSeconds = Math.max(0, Math.round((endTime - now) / 1000));

    // If we re-open the page and we're already in the last 10s, start ticking
    if (
      remainingSeconds > 0 &&
      remainingSeconds <= 10 &&
      !isEndTickingRef.current
    ) {
      startEndTicking();
    }

    if (remainingSeconds <= 0) {
      // Timer actually finished while we were away
      stopEndTicking(); // if it was ticking in the background

      setRemainingTimeInSeconds(0);

      // Handle completion just like in the interval finish case
      switchSessionType();

      setTimerPaused(true);
      setTimerRunning(false);

      timerEndTimeRef.current = null;
      saveToLocalStorage("timerEndTime", null);

      return;
    }

    // Update remaining time to reflect time elapsed while away
    setRemainingTimeInSeconds(remainingSeconds);

    // Resume ticking from the original endTime
    runInterval(endTime);
  }, [
    timerEndTimeRef,
    startEndTicking,
    stopEndTicking,
    switchSessionType,
    startCountdown,
    runInterval,
  ]);

  const startCountdownWithSound = () => {
    if (!timerPaused) return;

    playSound(timerOnClickSoundEffectRef.current);
    startCountdown();
  };

  useEffect(() => {
    startCountdownOnPageLoad();

    return () => {
      // Cleanup on unmount
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
      stopEndTicking(); // In case ticking was happening
    };
  }, [startCountdownOnPageLoad, stopEndTicking, timerIntervalRef]);

  return {
    startCountdown,
    startCountdownWithSound,
    startCountdownOnPageLoad,
  };
};

export default useStartCountdown;
