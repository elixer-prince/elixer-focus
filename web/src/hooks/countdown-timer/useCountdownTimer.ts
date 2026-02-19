import useCountdownContext from "@/hooks/countdown-timer/useCountdownContext";
import useEndTicking from "@/hooks/countdown-timer/useEndTicking";
import useStartCountdown from "@/hooks/countdown-timer/useStartCountdown";
import { clearIntervalIfItExists } from "@/utils/interval";
import { useEffect } from "react";

const useCountdownTimer = () => {
  const { startCountdownOnPageLoad } = useStartCountdown();
  const { stopEndTicking } = useEndTicking();

  const { timerIntervalRef } = useCountdownContext();

  useEffect(() => {
    startCountdownOnPageLoad();

    return () => {
      clearIntervalIfItExists(timerIntervalRef);
      stopEndTicking();
    };
  }, [startCountdownOnPageLoad, stopEndTicking, timerIntervalRef]);
};

export default useCountdownTimer;
