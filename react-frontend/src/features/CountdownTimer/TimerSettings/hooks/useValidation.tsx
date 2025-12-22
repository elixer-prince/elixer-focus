import { useCallback } from "react";
import useSessionContext from "@features/CountdownTimer/hooks/useSessionContext.tsx";
import useTimerSettingsContext from "@features/CountdownTimer/TimerSettings/hooks/useTimerSettingsContext.tsx";

const useValidation = () => {
    const { focusDuration, shortBreakDuration, longBreakDuration } =
        useSessionContext();

    const { draftFocus, draftShortBreak, draftLongBreak } =
        useTimerSettingsContext();

    const hasUnsavedChanges =
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
            // Allow empty string for better UX
            if (value === "") {
                setDraft("");
                return null;
            }

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

    return { hasUnsavedChanges, validateAndSet };
};

export default useValidation;
