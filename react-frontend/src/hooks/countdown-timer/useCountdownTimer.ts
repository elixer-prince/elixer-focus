import useEndTicking from "@/hooks/countdown-timer/useEndTicking";
import { useCountdownTimerContext } from "@/stores/CountdownTimerContext";
import useCountdownInterval from "@/hooks/countdown-timer/useCountdownInterval";
import useStartCountdown from "@/hooks/countdown-timer/useStartCountdown";
import { useEffect } from "react";

const useCountdownTimer = () => {
  const { startCountdownOnPageLoad } = useStartCountdown();
  const { clearIntervalIfItExists } = useCountdownInterval();
  const { stopEndTicking } = useEndTicking();

  const { timerIntervalRef } = useCountdownTimerContext();

  useEffect(() => {
    startCountdownOnPageLoad();

    return () => {
      clearIntervalIfItExists();
      stopEndTicking();
    };
  }, [startCountdownOnPageLoad, stopEndTicking, timerIntervalRef]);
};

export default useCountdownTimer;
