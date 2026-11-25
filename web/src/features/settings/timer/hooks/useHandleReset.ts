import {
  useFocusDuration,
  useLongBreakDuration,
  useSessionCountLimit,
  useShortBreakDuration,
} from "@/features/countdown-timer/stores/session-store";
import { useTimerSettingsContext } from "@/features/settings/timer/hooks/useTimerSettingsContext";
import toast from "react-hot-toast";
import { useCallback } from "react";

const useHandleReset = () => {
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

  const handleReset = useCallback(() => {
    setDraftFocus(focusDuration.toString());
    setDraftSessionCountLimit(sessionCountLimit.toString());
    setDraftShortBreak(shortBreakDuration.toString());
    setDraftLongBreak(longBreakDuration.toString());
    toast.success("Changes discarded");
  }, [
    focusDuration,
    sessionCountLimit,
    shortBreakDuration,
    longBreakDuration,
    setDraftFocus,
    setDraftSessionCountLimit,
    setDraftShortBreak,
    setDraftLongBreak,
  ]);

  return { handleReset };
};

export default useHandleReset;
