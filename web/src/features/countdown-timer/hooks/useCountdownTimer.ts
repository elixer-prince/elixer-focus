import useCountdownContext from "@/features/countdown-timer/hooks/useCountdownContext";
import useEndTicking from "@/features/countdown-timer/hooks/useEndTicking";
import useStartCountdown from "@/features/countdown-timer/hooks/useStartCountdown";
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
