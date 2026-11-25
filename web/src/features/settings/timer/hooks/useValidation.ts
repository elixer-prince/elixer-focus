import { useTimerSettingsContext } from "@/features/settings/timer/hooks/useTimerSettingsContext";
import {
  useFocusDuration,
  useLongBreakDuration,
  useSessionCountLimit,
  useShortBreakDuration,
} from "@/features/countdown-timer/stores/session-store";
import { useCallback } from "react";

const useValidation = () => {
  const focusDuration = useFocusDuration();
  const sessionCountLimit = useSessionCountLimit();
  const shortBreakDuration = useShortBreakDuration();
  const longBreakDuration = useLongBreakDuration();

  const {
    draftFocus,
    draftSessionCountLimit,
    draftShortBreak,
    draftLongBreak,
  } = useTimerSettingsContext();

  const validateSessionCountLimit = useCallback(
    (value: string): number | null => {
      if (value.trim() === "") return null;

      const numValue = Number(value);
      if (!Number.isInteger(numValue) || numValue < 1 || numValue > 8) {
        return null;
      }

      return numValue;
    },
    [],
  );

  const isSessionCountLimitInvalid =
    validateSessionCountLimit(draftSessionCountLimit) === null;

  const hasUnsavedChanges: boolean =
    draftFocus !== focusDuration.toString() ||
    draftSessionCountLimit !== sessionCountLimit.toString() ||
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

  return {
    hasUnsavedChanges,
    isSessionCountLimitInvalid,
    validateAndSet,
    validateSessionCountLimit,
  };
};

export default useValidation;
