import { useTimerSettingsContext } from "@/features/countdown-timer/components/TimerSettings/stores/TimerSettingsContext";
import {
  useFocusDuration,
  useLongBreakDuration,
  useShortBreakDuration,
} from "@/stores/countdown-timer/SessionStore.ts";
import { useEffect } from "react";

const useInputInitialisation = () => {
  const focusDuration = useFocusDuration();
  const shortBreakDuration = useShortBreakDuration();
  const longBreakDuration = useLongBreakDuration();

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
