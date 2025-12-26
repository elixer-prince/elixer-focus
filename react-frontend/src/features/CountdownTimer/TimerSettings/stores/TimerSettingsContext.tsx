import {
    createContext,
    type Dispatch,
    type ReactNode,
    type SetStateAction,
    useMemo,
    useState,
} from "react";
import useSessionContext from "@/";

interface TimerSettingsProps {
    children: ReactNode;
}

type TimerSettingsType = {
    draftFocus: string;
    draftShortBreak: string;
    draftLongBreak: string;
    setDraftFocus: Dispatch<SetStateAction<string>>;
    setDraftShortBreak: Dispatch<SetStateAction<string>>;
    setDraftLongBreak: Dispatch<SetStateAction<string>>;
};

const TimerSettingsContext = createContext<TimerSettingsType | null>(null);

const TimerSettingsProvider = ({ children }: TimerSettingsProps) => {
    const { focusDuration, shortBreakDuration, longBreakDuration } =
        useSessionContext();

    const [draftFocus, setDraftFocus] = useState<string>(
        focusDuration.toString(),
    );
    const [draftShortBreak, setDraftShortBreak] = useState<string>(
        shortBreakDuration.toString(),
    );
    const [draftLongBreak, setDraftLongBreak] = useState<string>(
        longBreakDuration.toString(),
    );

    const contextValues = useMemo(
        () => ({
            draftFocus,
            draftShortBreak,
            draftLongBreak,
            setDraftFocus,
            setDraftShortBreak,
            setDraftLongBreak,
        }),
        [
            draftFocus,
            draftShortBreak,
            draftLongBreak,
            setDraftFocus,
            setDraftShortBreak,
            setDraftLongBreak,
        ],
    );

    return (
        <TimerSettingsContext.Provider value={contextValues}>
            {children}
        </TimerSettingsContext.Provider>
    );
};

export { TimerSettingsProvider, TimerSettingsContext };
