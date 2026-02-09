import {
  useFocusDuration,
  useLongBreakDuration,
  useShortBreakDuration,
} from "@/stores/countdown-timer/SessionStore.ts";
import {
  createContext,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
  useContext,
  useMemo,
  useState,
} from "react";

interface TimerSettingsProps {
  children: ReactNode;
}

type TimerSettingsType = {
  draftFocus: string;
  draftShortBreak: string;
  draftLongBreak: string;
  setDraftFocus: Dispatch<SetStateAction<string>>;
  setDraftShortBreak: Dispatch<SetStateAction<string>>;
  setDraftLongBreak: Dispatch<SetStateAction<string>>;
};

const TimerSettingsContext = createContext<TimerSettingsType | null>(null);

export const TimerSettingsProvider = ({ children }: TimerSettingsProps) => {
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

export const useTimerSettingsContext = () => {
  const timerSettingsContext = useContext(TimerSettingsContext);

  if (!timerSettingsContext) {
    throw new Error(
      "useTimerSettingContext must be used within a TimerSettingsProvider!",
    );
  }

  return timerSettingsContext;
};
