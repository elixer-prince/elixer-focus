import { getFromLocalStorage } from "@utils/storage.ts";
import {
    createContext,
    type Dispatch,
    type ReactNode,
    type SetStateAction,
    useMemo,
    useState,
} from "react";

interface CountdownSessionProviderProps {
    children: ReactNode;
}

type CountdownSessionType = "Focus" | "Short Break" | "Long Break";

type CountdownSessionContextType = {
    focusDuration: number;
    shortBreakDuration: number;
    longBreakDuration: number;
    sessionCountLimit: number;
    currentSessionType: CountdownSessionType;
    currentSessionCount: number;
    totalSessionsCompleted: number;
    setFocusDuration: Dispatch<SetStateAction<number>>;
    setShortBreakDuration: Dispatch<SetStateAction<number>>;
    setLongBreakDuration: Dispatch<SetStateAction<number>>;
    setSessionCountLimit: Dispatch<SetStateAction<number>>;
    setCurrentSessionType: Dispatch<SetStateAction<CountdownSessionType>>;
    setCurrentSessionCount: Dispatch<SetStateAction<number>>;
    setTotalSessionsCompleted: Dispatch<SetStateAction<number>>;
};

const SessionContext = createContext<CountdownSessionContextType | undefined>(
    undefined,
);

const CountdownSessionProvider = ({
    children,
}: CountdownSessionProviderProps) => {
    const [focusDuration, setFocusDuration] = useState<number>(
        getFromLocalStorage("focusDuration") || 0.5,
    );
    const [shortBreakDuration, setShortBreakDuration] = useState<number>(
        getFromLocalStorage("shortBreakDuration") || 0.1,
    );
    const [longBreakDuration, setLongBreakDuration] = useState<number>(
        getFromLocalStorage("longBreakDuration") || 0.3,
    );
    const [sessionCountLimit, setSessionCountLimit] = useState<number>(
        getFromLocalStorage("sessionCountLimit") || 4,
    );
    const [currentSessionType, setCurrentSessionType] =
        useState<CountdownSessionType>(
            getFromLocalStorage("currentSessionType") || "Focus",
        );
    const [currentSessionCount, setCurrentSessionCount] = useState<number>(
        getFromLocalStorage("currentSessionCount") || 0,
    );
    const [totalSessionsCompleted, setTotalSessionsCompleted] =
        useState<number>(getFromLocalStorage("totalSessionsCompleted") || 0);

    const contextValue: CountdownSessionContextType = useMemo(
        () => ({
            focusDuration,
            shortBreakDuration,
            longBreakDuration,
            sessionCountLimit,
            currentSessionType,
            currentSessionCount,
            totalSessionsCompleted,
            setFocusDuration,
            setShortBreakDuration,
            setLongBreakDuration,
            setSessionCountLimit,
            setCurrentSessionType,
            setCurrentSessionCount,
            setTotalSessionsCompleted,
        }),
        [
            focusDuration,
            shortBreakDuration,
            longBreakDuration,
            sessionCountLimit,
            currentSessionType,
            currentSessionCount,
            totalSessionsCompleted,
        ],
    );

    return (
        <SessionContext.Provider value={contextValue}>
            {children}
        </SessionContext.Provider>
    );
};

export { CountdownSessionProvider, SessionContext };
