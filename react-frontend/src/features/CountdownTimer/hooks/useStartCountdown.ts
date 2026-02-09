import useCountdownHelpers from "@/features/CountdownTimer/hooks/useCountdownHelpers";
import useCountdownInterval from "@/features/CountdownTimer/hooks/useCountdownInterval";
import useEndTicking from "@/features/CountdownTimer/hooks/useEndTicking";
import useSessionSwitch from "@/features/CountdownTimer/hooks/useSessionSwitch";
import { useCountdownTimerContext } from "@/features/CountdownTimer/stores/CountdownTimerContext";
import {
  useRemainingTimeInSeconds,
  useSetRemainingTimeInSeconds,
  useSetTimerPaused,
  useSetTimerRunning,
  useTimerPaused,
} from "@/features/CountdownTimer/stores/CountdownTimerStore";
import { calculateEndTime } from "@/features/CountdownTimer/utils/timerCalculations";
import { playSound } from "@/utils/sound";
import { saveToLocalStorage } from "@/utils/storage";
import { useCallback, useEffect } from "react";

const useStartCountdown = () => {
  const { startEndTicking, stopEndTicking } = useEndTicking();
  const { switchSessionType } = useSessionSwitch();
  const { clearIntervalIfItExists, runInterval } = useCountdownInterval();
  const {
    calculateNewRemainingSeconds,
    handleEndedTimerWhileAway,
    timerShouldBeTickingOnRefresh,
    timerEndedWhileAway,
    timerShouldNotBeActiveOnRefresh,
  } = useCountdownHelpers();

  const timerPaused = useTimerPaused();
  const remainingTimeInSeconds = useRemainingTimeInSeconds();
  const setTimerRunning = useSetTimerRunning();
  const setTimerPaused = useSetTimerPaused();
  const setRemainingTimeInSeconds = useSetRemainingTimeInSeconds();

  const { timerOnClickSoundEffectRef, timerIntervalRef, timerEndTimeRef } =
    useCountdownTimerContext();

  /*------------------------------------------------------------
  |  Main Start Functions
  |------------------------------------------------------------
  |
  */

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
    switchSessionType,
    startCountdown,
    runInterval,
  ]);

  // * Locked * //
  const startCountdownWithSound = () => {
    if (!timerPaused) return;

    playSound(timerOnClickSoundEffectRef.current);
    startCountdown();
  };

  /*------------------------------------------------------------
  |  Use Effect Hooks
  |------------------------------------------------------------
  |
  */

  // * Locked * //
  useEffect(() => {
    startCountdownOnPageLoad();

    return () => {
      clearIntervalIfItExists();
      stopEndTicking();
    };
  }, [startCountdownOnPageLoad, stopEndTicking, timerIntervalRef]);

  return {
    startCountdown,
    startCountdownWithSound,
    startCountdownOnPageLoad,
  };
};

export default useStartCountdown;
