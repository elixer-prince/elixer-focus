import { useTimerSettingsContext } from "@/features/countdown-timer/components/TimerSettings/stores/TimerSettingsContext";
import {
  useFocusDuration,
  useLongBreakDuration,
  useShortBreakDuration,
} from "@/features/countdown-timer/stores/SessionStore";
import { useCallback } from "react";

const useValidation = () => {
  const focusDuration = useFocusDuration();
  const shortBreakDuration = useShortBreakDuration();
  const longBreakDuration = useLongBreakDuration();

  const { draftFocus, draftShortBreak, draftLongBreak } =
    useTimerSettingsContext();

  const hasUnsavedChanges: boolean =
    draftFocus !== focusDuration.toString() ||
    draftShortBreak !== shortBreakDuration.toString() ||
    draftLongBreak !== longBreakDuration.toString();

  // Validation function
  const validateAndSet = useCallback(
    (
      value: string,
      setDraft: (value: string) => void,
      minValue: number = 1,
    ): number | null => {
      emptyInputIfNoValue(value, setDraft);

      const numValue = Number(value);

      // If not a valid number, revert to min value
      if (isNaN(numValue) || !isFinite(numValue)) {
        setDraft(minValue.toString());
        return minValue;
      }

      // If below minimum, set to min but allow typing
      if (numValue < minValue) {
        setDraft(value);
        return null;
      }

      // Valid number
      setDraft(value);
      return numValue;
    },
    [],
  );

  const emptyInputIfNoValue = (
    value: string,
    setDraft: (value: string) => void,
  ) => {
    if (value === "") {
      setDraft("");
      return null;
    }
  };

  return { hasUnsavedChanges, validateAndSet };
};

export default useValidation;
