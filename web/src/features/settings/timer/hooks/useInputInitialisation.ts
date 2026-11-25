import { useTimerSettingsContext } from "@/features/settings/timer/hooks/useTimerSettingsContext";
import {
  useFocusDuration,
  useLongBreakDuration,
  useSessionCountLimit,
  useShortBreakDuration,
} from "@/features/countdown-timer/stores/session-store";
import { useEffect } from "react";

const useInputInitialisation = () => {
  const focusDuration = useFocusDuration();
  const sessionCountLimit = useSessionCountLimit();
  const shortBreakDuration = useShortBreakDuration();
  const longBreakDuration = useLongBreakDuration();

  const {
    setDraftFocus,
    setDraftSessionCountLimit,
    setDraftShortBreak,
    setDraftLongBreak,
  } = useTimerSettingsContext();

  useEffect(() => {
    setDraftFocus(focusDuration.toString());
  }, [focusDuration, setDraftFocus]);

  useEffect(() => {
    setDraftSessionCountLimit(sessionCountLimit.toString());
  }, [sessionCountLimit, setDraftSessionCountLimit]);

  useEffect(() => {
    setDraftShortBreak(shortBreakDuration.toString());
  }, [shortBreakDuration, setDraftShortBreak]);

  useEffect(() => {
    setDraftLongBreak(longBreakDuration.toString());
  }, [longBreakDuration, setDraftLongBreak]);
};

export default useInputInitialisation;
