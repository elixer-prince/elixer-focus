import { useTimerSettingsContext } from "@/features/settings/timer/hooks/useTimerSettingsContext";
import useValidation from "@/features/settings/timer/hooks/useValidation";
import { dispatchTimerCommand } from "@/features/countdown-timer/services/timer-coordinator";
import {
  useSetRemainingTimeInSeconds,
  useSetStartTimeInMinutes,
  useTimerPaused,
  useTimerRunning,
} from "@/features/countdown-timer/stores/countdown-store";
import {
  useCurrentSessionType,
  useSetFocusDuration,
  useSetLongBreakDuration,
  useSetShortBreakDuration,
} from "@/features/countdown-timer/stores/session-store";
import { convertMinutesToSeconds } from "@/utils/conversion";
import toast from "react-hot-toast";
import { useCallback } from "react";

const useHandleSave = () => {
  const currentSessionType = useCurrentSessionType();
  const setFocusDuration = useSetFocusDuration();
  const setShortBreakDuration = useSetShortBreakDuration();
  const setLongBreakDuration = useSetLongBreakDuration();

  const timerRunning = useTimerRunning();
  const timerPaused = useTimerPaused();
  const setStartTimeInMinutes = useSetStartTimeInMinutes();
  const setRemainingTimeInSeconds = useSetRemainingTimeInSeconds();

  const {
    draftFocus,
    draftSessionCountLimit,
    draftShortBreak,
    draftLongBreak,
    setDraftFocus,
    setDraftShortBreak,
    setDraftLongBreak,
  } = useTimerSettingsContext();

  const { validateAndSet, validateSessionCountLimit } = useValidation();

  const handleSave = useCallback(() => {
    let hasError = false;

    // Validate and convert each draft
    const focusNum = validateAndSet(draftFocus, setDraftFocus, 1);
    const shortBreakNum = validateAndSet(
      draftShortBreak,
      setDraftShortBreak,
      1,
    );
    const longBreakNum = validateAndSet(draftLongBreak, setDraftLongBreak, 5);
    const sessionCountLimit = validateSessionCountLimit(draftSessionCountLimit);

    // Check for validation errors
    if (focusNum === null || focusNum < 1) {
      toast.error("Focus duration must be at least 1 minute");
      setDraftFocus("25");
      hasError = true;
    }

    if (shortBreakNum === null || shortBreakNum < 1) {
      toast.error("Short break must be at least 1 minute");
      setDraftShortBreak("5");
      hasError = true;
    }

    if (longBreakNum === null || longBreakNum < 5) {
      toast.error("Long break must be at least 5 minutes");
      setDraftLongBreak("15");
      hasError = true;
    }

    if (sessionCountLimit === null) {
      toast.error(
        "Focus sessions before a long break must be a whole number from 1 to 8",
      );
    }

    if (hasError || sessionCountLimit === null) return;

    // All valid - update session stores (persist middleware handles localStorage)
    setFocusDuration(focusNum!);
    setShortBreakDuration(shortBreakNum!);
    setLongBreakDuration(longBreakNum!);
    dispatchTimerCommand({
      type: "set-session-count-limit",
      limit: sessionCountLimit,
    });

    // AUTO-UPDATE TIMER if it's not running
    const isTimerIdle = !timerRunning || timerPaused;

    if (isTimerIdle) {
      // Determine which duration applies to current session
      let newDuration = focusNum!;
      if (currentSessionType === "Short Break") newDuration = shortBreakNum!;
      if (currentSessionType === "Long Break") newDuration = longBreakNum!;

      // Update timer stores
      setStartTimeInMinutes(newDuration);
      setRemainingTimeInSeconds(convertMinutesToSeconds(newDuration));
    }

    toast.success("Timer settings saved successfully!");
  }, [
    currentSessionType,
    draftFocus,
    draftSessionCountLimit,
    draftShortBreak,
    draftLongBreak,
    timerRunning,
    timerPaused,
    validateAndSet,
    validateSessionCountLimit,
    setFocusDuration,
    setShortBreakDuration,
    setLongBreakDuration,
    setDraftFocus,
    setDraftShortBreak,
    setDraftLongBreak,
    setStartTimeInMinutes,
    setRemainingTimeInSeconds,
  ]);

  return { handleSave };
};

export default useHandleSave;
