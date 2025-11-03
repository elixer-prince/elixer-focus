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
    sessionType: SessionType;
    setSessionType: Dispatch<SetStateAction<SessionType>>;
};

const SessionContext = createContext<SessionContextType | undefined>(undefined);

const SessionProvider = ({ children }: SessionProviderProps) => {
    const [sessionType, setSessionType] = useState<SessionType>("Focus");

    const contextValue: SessionContextType = useMemo(
        () => ({
            sessionType,
            setSessionType,
        }),
        [sessionType],
    );

    return (
        <SessionContext.Provider value={contextValue}>
            {children}
        </SessionContext.Provider>
    );
};

export { SessionContext, SessionProvider };
