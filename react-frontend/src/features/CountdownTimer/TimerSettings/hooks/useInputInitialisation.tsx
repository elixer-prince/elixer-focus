import useSessionContext from "@features/CountdownTimer/hooks/useSessionContext.tsx";
import { useEffect } from "react";
import useTimerSettingsContext from "@features/CountdownTimer/TimerSettings/hooks/useTimerSettingsContext.tsx";

const useInputInitialisation = () => {
    const { focusDuration, shortBreakDuration, longBreakDuration } =
        useSessionContext();

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
