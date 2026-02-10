import CountdownContext from "@/stores/countdown-timer/CountdownContext";
import { useContext } from "react";

const useCountdownContext = () => {
  const countdownTimerContext = useContext(CountdownContext);

  if (!countdownTimerContext)
    throw new Error("CountdownContext must be defined!");

  return countdownTimerContext;
};

export default useCountdownContext;
