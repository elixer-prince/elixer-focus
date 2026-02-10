import { useTimerSettingsContext } from "@/features/settings/timer/hooks/useTimerSettingsContext";
import {
  useFocusDuration,
  useLongBreakDuration,
  useShortBreakDuration,
} from "@/stores/countdown-timer/SessionStore";
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
