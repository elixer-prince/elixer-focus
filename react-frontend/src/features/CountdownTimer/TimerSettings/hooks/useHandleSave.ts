import useSessionContext from "@/";
import useCountdownTimerContext from "@features/CountdownTimer/hooks/CountdownTimer/useCountdownTimerContext.tsx";
import useTimerSettingsContext from "@features/CountdownTimer/TimerSettings/hooks/useTimerSettingsContext.tsx";
import useValidation from "@/";
import { convertMinutesToSeconds } from "@utils/conversion.ts";
import { saveToLocalStorage } from "@utils/storage.ts";
import { useCallback } from "react";

const UseHandleSave = () => {
    const {
        draftFocus,
        draftShortBreak,
        draftLongBreak,
        setDraftFocus,
        setDraftShortBreak,
        setDraftLongBreak,
    } = useTimerSettingsContext();

    const {
        timerRunning,
        timerPaused,
        setStartTimeInMinutes,
        setRemainingTimeInSeconds,
    } = useCountdownTimerContext();

    const {
        setFocusDuration,
        setShortBreakDuration,
        setLongBreakDuration,
        currentSessionType,
    } = useSessionContext();

    const { validateAndSet } = useValidation();

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

    return { handleSave };
};

export default UseHandleSave;
