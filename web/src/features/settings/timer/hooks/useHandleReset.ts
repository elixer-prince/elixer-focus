import {
  useFocusDuration,
  useLongBreakDuration,
  useShortBreakDuration,
} from "@/features/countdown-timer/stores/session-store";
import { useTimerSettingsContext } from "@/features/settings/timer/hooks/useTimerSettingsContext";
import toast from "react-hot-toast";
import { useCallback } from "react";

const useHandleReset = () => {
  const focusDuration = useFocusDuration();
  const shortBreakDuration = useShortBreakDuration();
  const longBreakDuration = useLongBreakDuration();

  const { setDraftFocus, setDraftShortBreak, setDraftLongBreak } =
    useTimerSettingsContext();

  const handleReset = useCallback(() => {
    setDraftFocus(focusDuration.toString());
    setDraftShortBreak(shortBreakDuration.toString());
    setDraftLongBreak(longBreakDuration.toString());
    toast.success("Changes discarded");
  }, [
    focusDuration,
    shortBreakDuration,
    longBreakDuration,
    setDraftFocus,
    setDraftShortBreak,
    setDraftLongBreak,
  ]);

  return { handleReset };
};

export default useHandleReset;
