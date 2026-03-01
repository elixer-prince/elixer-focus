import type { CountdownTimerContextType } from "@/features/countdown-timer/types/session";
import { createContext } from "react";

const CountdownContext = createContext<CountdownTimerContextType | undefined>(
  undefined,
);

export default CountdownContext;
