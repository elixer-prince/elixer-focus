import { useContext } from "react";
import CountdownContext from "@/stores/countdown-timer/CountdownContext.tsx";

const useCountdownContext = () => {
  const countdownTimerContext = useContext(CountdownContext);

  if (!countdownTimerContext)
    throw new Error("CountdownContext must be defined!");

  return countdownTimerContext;
};

export default useCountdownContext;
