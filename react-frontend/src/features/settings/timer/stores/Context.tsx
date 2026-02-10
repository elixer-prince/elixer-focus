import { createContext } from "react";
import type { TimerSettingsType } from "@/features/settings/timer/types/timer-settings.ts";

const TimerSettingsContext = createContext<TimerSettingsType | null>(null);

export default TimerSettingsContext;
