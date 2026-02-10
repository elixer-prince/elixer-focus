import type { CountdownTimerContextType } from "@/types/countdown-timer";
import { createContext } from "react";

const CountdownContext = createContext<CountdownTimerContextType | undefined>(
  undefined,
);

export default CountdownContext;
