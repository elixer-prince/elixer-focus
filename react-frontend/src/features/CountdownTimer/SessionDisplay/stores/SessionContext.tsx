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
    const [focusDuration, setFocusDuration] = useState<number>(25);
    const [shortBreakDuration, setShortBreakDuration] = useState<number>(5);
    const [longBreakDuration, setLongBreakDuration] = useState<number>(15);
    const [sessionCountLimit, setSessionCountLimit] = useState<number>(4);
    const [currentSessionType, setCurrentSessionType] =
        useState<CountdownSessionType>("Focus");
    const [currentSessionCount, setCurrentSessionCount] = useState<number>(0);
    const [totalSessionsCompleted, setTotalSessionsCompleted] =
        useState<number>(0);

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

export { SessionContext, CountdownSessionProvider };
