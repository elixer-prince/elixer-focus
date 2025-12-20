// @features/CountdownTimer/TimerSettings/hooks/useTimerSettings.tsx
import { useCallback, useEffect, useState } from "react";
import { saveToLocalStorage } from "@utils/storage.ts";
import useSessionContext from "@features/CountdownTimer/hooks/useSessionContext.tsx";
import useCountdownTimerContext from "@features/CountdownTimer/hooks/useCountdownTimerContext.tsx";
import { convertMinutesToSeconds } from "@utils/conversion.ts";

const useTimerSettings = () => {
    const {
        focusDuration,
        shortBreakDuration,
        longBreakDuration,
        setFocusDuration,
        setShortBreakDuration,
        setLongBreakDuration,
        currentSessionType,
    } = useSessionContext();

    const {
        timerRunning,
        timerPaused,
        setStartTimeInMinutes,
        setRemainingTimeInSeconds,
    } = useCountdownTimerContext();

    // Local draft state
    const [draftFocus, setDraftFocus] = useState<string>(
        focusDuration.toString(),
    );
    const [draftShortBreak, setDraftShortBreak] = useState<string>(
        shortBreakDuration.toString(),
    );
    const [draftLongBreak, setDraftLongBreak] = useState<string>(
        longBreakDuration.toString(),
    );

    // Initialize drafts when stores loads
    useEffect(() => {
        setDraftFocus(focusDuration.toString());
    }, [focusDuration]);

    useEffect(() => {
        setDraftShortBreak(shortBreakDuration.toString());
    }, [shortBreakDuration]);

    useEffect(() => {
        setDraftLongBreak(longBreakDuration.toString());
    }, [longBreakDuration]);

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

    // Check for unsaved changes
    const hasUnsavedChanges =
        draftFocus !== focusDuration.toString() ||
        draftShortBreak !== shortBreakDuration.toString() ||
        draftLongBreak !== longBreakDuration.toString();

    // Save handler
    const handleSave = useCallback(() => {
        let hasError = false;

        // Validate and convert each draft
        const focusNum = validateAndSet(draftFocus, setDraftFocus, 1);
        const shortBreakNum = validateAndSet(
            draftShortBreak,
            setDraftShortBreak,
            1,
        );
        const longBreakNum = validateAndSet(
            draftLongBreak,
            setDraftLongBreak,
            5,
        );

        // Check for validation errors
        if (focusNum === null || focusNum < 1) {
            alert("Focus duration must be at least 1 minute");
            setDraftFocus("25");
            hasError = true;
        }

        if (shortBreakNum === null || shortBreakNum < 1) {
            alert("Short break must be at least 1 minute");
            setDraftShortBreak("5");
            hasError = true;
        }

        if (longBreakNum === null || longBreakNum < 5) {
            alert("Long break must be at least 5 minutes");
            setDraftLongBreak("15");
            hasError = true;
        }

        if (hasError) return;

        // All valid - update session stores
        setFocusDuration(focusNum!);
        setShortBreakDuration(shortBreakNum!);
        setLongBreakDuration(longBreakNum!);

        // Save session durations to localStorage
        saveToLocalStorage("focusDuration", focusNum!);
        saveToLocalStorage("shortBreakDuration", shortBreakNum!);
        saveToLocalStorage("longBreakDuration", longBreakNum!);

        // AUTO-UPDATE TIMER if it's not running
        const isTimerIdle = !timerRunning || timerPaused;

        if (isTimerIdle) {
            // Determine which duration applies to current session
            let newDuration = focusNum!;
            if (currentSessionType === "Short Break")
                newDuration = shortBreakNum!;
            if (currentSessionType === "Long Break")
                newDuration = longBreakNum!;

            // Update timer stores
            setStartTimeInMinutes(newDuration);
            setRemainingTimeInSeconds(convertMinutesToSeconds(newDuration));

            // Save timer state too
            saveToLocalStorage("startTimeInMinutes", newDuration);
            saveToLocalStorage(
                "remainingTimeInSeconds",
                convertMinutesToSeconds(newDuration),
            );
        }

        alert("Timer settings saved successfully!");
    }, [
        draftFocus,
        draftShortBreak,
        draftLongBreak,
        setFocusDuration,
        setShortBreakDuration,
        setLongBreakDuration,
        validateAndSet,
        setDraftFocus,
        setDraftShortBreak,
        setDraftLongBreak,
        timerRunning,
        timerPaused,
        currentSessionType,
        setStartTimeInMinutes,
        setRemainingTimeInSeconds,
    ]);

    return {
        draftFocus,
        draftShortBreak,
        draftLongBreak,
        validateAndSet,
        hasUnsavedChanges,
        handleSave,
        setDraftFocus,
        setDraftShortBreak,
        setDraftLongBreak,
    };
};

export default useTimerSettings;
