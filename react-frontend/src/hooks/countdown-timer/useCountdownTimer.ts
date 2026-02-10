import useCountdownContext from "@/hooks/countdown-timer/useCountdownContext";
import useCountdownInterval from "@/hooks/countdown-timer/useCountdownInterval";
import useEndTicking from "@/hooks/countdown-timer/useEndTicking";
import useStartCountdown from "@/hooks/countdown-timer/useStartCountdown";
import { useEffect } from "react";

const useCountdownTimer = () => {
  const { startCountdownOnPageLoad } = useStartCountdown();
  const { clearIntervalIfItExists } = useCountdownInterval();
  const { stopEndTicking } = useEndTicking();

  const { timerIntervalRef } = useCountdownContext();

  useEffect(() => {
    startCountdownOnPageLoad();

    return () => {
      clearIntervalIfItExists();
      stopEndTicking();
    };
  }, [
    startCountdownOnPageLoad,
    stopEndTicking,
    clearIntervalIfItExists,
    timerIntervalRef,
  ]);
};

export default useCountdownTimer;
