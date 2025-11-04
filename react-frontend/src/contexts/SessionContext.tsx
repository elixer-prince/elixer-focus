import {
    createContext,
    useMemo,
    useState,
    type Dispatch,
    type ReactNode,
    type SetStateAction,
} from "react";

interface SessionProviderProps {
    children: ReactNode;
}

type SessionType = "Focus" | "Short Break" | "Long Break";

type SessionContextType = {
    focusDuration: number;
    shortBreakDuration: number;
    longBreakDuration: number;
    sessionCountLimit: number;
    currentSessionType: SessionType;
    currentSessionCount: number;
    totalSessionsCompleted: number;
    setFocusDuration: Dispatch<SetStateAction<number>>;
    setShortBreakDuration: Dispatch<SetStateAction<number>>;
    setLongBreakDuration: Dispatch<SetStateAction<number>>;
    setSessionCountLimit: Dispatch<SetStateAction<number>>;
    setCurrentSessionType: Dispatch<SetStateAction<SessionType>>;
    setCurrentSessionCount: Dispatch<SetStateAction<number>>;
    setTotalSessionsCompleted: Dispatch<SetStateAction<number>>;
};

const SessionContext = createContext<SessionContextType | undefined>(undefined);

const SessionProvider = ({ children }: SessionProviderProps) => {
    const [focusDuration, setFocusDuration] = useState<number>(25);
    const [shortBreakDuration, setShortBreakDuration] = useState<number>(5);
    const [longBreakDuration, setLongBreakDuration] = useState<number>(15);
    const [sessionCountLimit, setSessionCountLimit] = useState<number>(4);
    const [currentSessionType, setCurrentSessionType] =
        useState<SessionType>("Focus");
    const [currentSessionCount, setCurrentSessionCount] = useState<number>(0);
    const [totalSessionsCompleted, setTotalSessionsCompleted] =
        useState<number>(0);

    const contextValue: SessionContextType = useMemo(
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

export { SessionContext, SessionProvider };
