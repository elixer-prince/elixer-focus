import useEndTicking from "@/hooks/countdown-timer/useEndTicking";
import { useCountdownTimerContext } from "@/stores/countdown-timer/Context.tsx";
import {
  useRemainingTimeInSeconds,
  useSetRemainingTimeInSeconds,
  useSetTimerPaused,
  useSetTimerRunning,
  useTimerPaused,
} from "@/stores/countdown-timer/store.ts";
import { calculateEndTime } from "@/features/countdown-timer/utils/timerCalculations";
import useCountdownHelpers from "@/hooks/countdown-timer/useCountdownHelpers";
import useCountdownInterval from "@/hooks/countdown-timer/useCountdownInterval";
import { playSound } from "@/utils/sound";
import { saveToLocalStorage } from "@/utils/storage";
import { useCallback } from "react";

const useStartCountdown = () => {
  const { startEndTicking, stopEndTicking } = useEndTicking();
  const { clearIntervalIfItExists, runInterval } = useCountdownInterval();
  const { calculateNewRemainingSeconds } = useCountdownHelpers();
  const {
    timerEndedWhileAway,
    timerShouldBeTickingOnRefresh,
    timerShouldNotBeActiveOnRefresh,
    handleEndedTimerWhileAway,
  } = useCountdownHelpers();

  const timerPaused = useTimerPaused();
  const remainingTimeInSeconds = useRemainingTimeInSeconds();
  const setTimerRunning = useSetTimerRunning();
  const setTimerPaused = useSetTimerPaused();
  const setRemainingTimeInSeconds = useSetRemainingTimeInSeconds();

  const { timerOnClickSoundEffectRef, timerEndTimeRef } =
    useCountdownTimerContext();

  // * Locked * //
  const startCountdown = useCallback(() => {
    stopEndTicking();

    setTimerPaused(false);
    setTimerRunning(true);

    const endTime = calculateEndTime(remainingTimeInSeconds);

    // Save the end time to local storage
    // and as a reference
    timerEndTimeRef.current = endTime;
    saveToLocalStorage("timerEndTime", endTime);

    runInterval(endTime);
  }, [runInterval, timerEndTimeRef, stopEndTicking]);

  // * Locked * //
  const startCountdownWithSound = () => {
    if (!timerPaused) return;

    playSound(timerOnClickSoundEffectRef.current);
    startCountdown();
  };

  // * Locked * //
  /**
   * Starts the timer on page load if the timer is
   * not paused or running.
   *
   * @returns {void}
   */
  const startCountdownOnPageLoad = useCallback(() => {
    if (timerShouldNotBeActiveOnRefresh()) return;

    if (!timerEndTimeRef.current) return;

    clearIntervalIfItExists();

    const endTime = timerEndTimeRef.current;
    const remainingSeconds = calculateNewRemainingSeconds(endTime);

    if (timerShouldBeTickingOnRefresh(remainingSeconds)) startEndTicking();

    if (timerEndedWhileAway(remainingSeconds))
      return handleEndedTimerWhileAway();

    setRemainingTimeInSeconds(remainingSeconds);
    runInterval(endTime);
  }, [
    timerEndTimeRef,
    startEndTicking,
    stopEndTicking,
    startCountdown,
    runInterval,
  ]);

  return {
    startCountdown,
    startCountdownWithSound,
    startCountdownOnPageLoad,
  };
};

export default useStartCountdown;
