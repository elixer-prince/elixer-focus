import type { TimerSettingsType } from "@/features/settings/timer/types/timer-settings";
import { createContext } from "react";

const TimerSettingsContext = createContext<TimerSettingsType | null>(null);

export default TimerSettingsContext;
