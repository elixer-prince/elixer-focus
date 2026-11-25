import useCountdownContext from "@/features/countdown-timer/hooks/useCountdownContext";
import useEndTicking from "@/features/countdown-timer/hooks/useEndTicking";
import usePreventTabThrottling from "@/features/countdown-timer/hooks/usePreventTabThrottling";
import useStartCountdown from "@/features/countdown-timer/hooks/useStartCountdown";
import useTimerCoordinator from "@/features/countdown-timer/hooks/useTimerCoordinator";
import {
  useTimerPaused,
  useTimerRunning,
} from "@/features/countdown-timer/stores/countdown-store";
import { getFromLocalStorage } from "@/utils/storage";
import { clearIntervalIfItExists } from "@/utils/interval";
import { useLayoutEffect, useRef } from "react";

const useCountdownTimer = () => {
  const coordinator = useTimerCoordinator();
  const { startCountdownOnPageLoad } = useStartCountdown();
  const { stopEndTicking } = useEndTicking();
  const timerRunning = useTimerRunning();
  const timerPaused = useTimerPaused();
  const { timerEndTimeRef, timerIntervalRef, sessionProgressIntervalRef } =
    useCountdownContext();

  // Prevent browser from throttling the tab while timer is running
  usePreventTabThrottling();

  // Store the latest function in a ref so the effect can call it
  // without re-running when the function reference changes.
  const startCountdownOnPageLoadRef = useRef(startCountdownOnPageLoad);
  startCountdownOnPageLoadRef.current = startCountdownOnPageLoad;
  const lastStartedEndTimeRef = useRef<number | null>(null);

  useLayoutEffect(() => {
    if (!coordinator.ready) return;

    const endTime = getFromLocalStorage<number>("timerEndTime");
    timerEndTimeRef.current = endTime;

    if (timerPaused || !timerRunning) {
      lastStartedEndTimeRef.current = null;
      clearIntervalIfItExists(timerIntervalRef);
      clearIntervalIfItExists(sessionProgressIntervalRef);
      stopEndTicking();
      return;
    }

    if (endTime === null || lastStartedEndTimeRef.current === endTime) return;
    if (!coordinator.isCoordinator && endTime <= Date.now()) return;

    lastStartedEndTimeRef.current = endTime;
    startCountdownOnPageLoadRef.current();

    return () => {
      clearIntervalIfItExists(timerIntervalRef);
      stopEndTicking();
    };
  }, [
    coordinator.ready,
    coordinator.isCoordinator,
    timerPaused,
    timerRunning,
    timerEndTimeRef,
    timerIntervalRef,
    sessionProgressIntervalRef,
    stopEndTicking,
  ]);
};

export default useCountdownTimer;
