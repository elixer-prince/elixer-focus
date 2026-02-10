import TimerSettingsContext from "@/features/settings/timer/stores/Context";
import { useContext } from "react";

export const useTimerSettingsContext = () => {
  const timerSettingsContext = useContext(TimerSettingsContext);

  if (!timerSettingsContext) {
    throw new Error(
      "useTimerSettingContext must be used within a TimerSettingsProvider!",
    );
  }

  return timerSettingsContext;
};
