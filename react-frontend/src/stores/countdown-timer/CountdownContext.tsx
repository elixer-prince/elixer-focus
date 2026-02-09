import { createContext } from "react";
import type { CountdownTimerContextType } from "@/types/countdown-timer.ts";

const CountdownContext = createContext<CountdownTimerContextType | undefined>(
  undefined,
);

export default CountdownContext;
