import useCountdownContext from "@/features/countdown-timer/hooks/useCountdownContext";
import useEndTicking from "@/features/countdown-timer/hooks/useEndTicking";
import usePreventTabThrottling from "@/features/countdown-timer/hooks/usePreventTabThrottling";
import useStartCountdown from "@/features/countdown-timer/hooks/useStartCountdown";
import { clearIntervalIfItExists } from "@/utils/interval";
import { useLayoutEffect, useRef } from "react";

const useCountdownTimer = () => {
  const { startCountdownOnPageLoad } = useStartCountdown();
  const { stopEndTicking } = useEndTicking();

  const { timerIntervalRef } = useCountdownContext();

  // Prevent browser from throttling the tab while timer is running
  usePreventTabThrottling();

  // Store the latest function in a ref so the effect can call it
  // without re-running when the function reference changes.
  const startCountdownOnPageLoadRef = useRef(startCountdownOnPageLoad);
  startCountdownOnPageLoadRef.current = startCountdownOnPageLoad;

  useLayoutEffect(() => {
    startCountdownOnPageLoadRef.current();

    return () => {
      clearIntervalIfItExists(timerIntervalRef);
      stopEndTicking();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
};

export default useCountdownTimer;
