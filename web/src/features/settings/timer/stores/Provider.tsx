import TimerSettingsContext from "@/features/settings/timer/stores/Context";
import {
  useFocusDuration,
  useLongBreakDuration,
  useShortBreakDuration,
} from "@/stores/countdown-timer/session-store";
import { type PropsWithChildren, useMemo, useState } from "react";

const TimerSettingsProvider = ({ children }: PropsWithChildren) => {
  const focusDuration = useFocusDuration();
  const shortBreakDuration = useShortBreakDuration();
  const longBreakDuration = useLongBreakDuration();

  const [draftFocus, setDraftFocus] = useState<string>(
    focusDuration.toString(),
  );
  const [draftShortBreak, setDraftShortBreak] = useState<string>(
    shortBreakDuration.toString(),
  );
  const [draftLongBreak, setDraftLongBreak] = useState<string>(
    longBreakDuration.toString(),
  );

  const contextValues = useMemo(
    () => ({
      draftFocus,
      draftShortBreak,
      draftLongBreak,
      setDraftFocus,
      setDraftShortBreak,
      setDraftLongBreak,
    }),
    [
      draftFocus,
      draftShortBreak,
      draftLongBreak,
      setDraftFocus,
      setDraftShortBreak,
      setDraftLongBreak,
    ],
  );

  return (
    <TimerSettingsContext.Provider value={contextValues}>
      {children}
    </TimerSettingsContext.Provider>
  );
};

export default TimerSettingsProvider;
