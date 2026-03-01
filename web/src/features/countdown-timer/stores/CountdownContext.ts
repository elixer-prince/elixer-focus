import type { CountdownTimerContextType } from "@/features/countdown-timer/types/context";
import { createContext } from "react";

const CountdownContext = createContext<CountdownTimerContextType | undefined>(
  undefined,
);

export default CountdownContext;
