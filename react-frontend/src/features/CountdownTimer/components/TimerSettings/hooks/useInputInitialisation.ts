import { useTimerSettingsContext } from "@/features/CountdownTimer/components/TimerSettings/stores/TimerSettingsContext.tsx";
import { useSessionContext } from "@/features/CountdownTimer/stores/SessionContext.tsx";
import { useEffect } from "react";

const useInputInitialisation = () => {
  const { focusDuration, shortBreakDuration, longBreakDuration } =
    useSessionContext();

  const { setDraftFocus, setDraftShortBreak, setDraftLongBreak } =
    useTimerSettingsContext();

  useEffect(() => {
    setDraftFocus(focusDuration.toString());
  }, [focusDuration, setDraftFocus]);

  useEffect(() => {
    setDraftShortBreak(shortBreakDuration.toString());
  }, [shortBreakDuration, setDraftShortBreak]);

  useEffect(() => {
    setDraftLongBreak(longBreakDuration.toString());
  }, [longBreakDuration, setDraftLongBreak]);
};

export default useInputInitialisation;
