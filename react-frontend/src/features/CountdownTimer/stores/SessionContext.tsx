import { getFromLocalStorage } from "@/utils/storage.ts";
import {
  createContext,
  type Dispatch,
  type PropsWithChildren,
  type SetStateAction,
  useContext,
  useMemo,
  useState,
} from "react";

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

const CountdownSessionContext = createContext<
  CountdownSessionContextType | undefined
>(undefined);

export const CountdownSessionProvider = ({ children }: PropsWithChildren) => {
  const [focusDuration, setFocusDuration] = useState<number>(
    getFromLocalStorage("focusDuration") || 25,
  );
  const [shortBreakDuration, setShortBreakDuration] = useState<number>(
    getFromLocalStorage("shortBreakDuration") || 5,
  );
  const [longBreakDuration, setLongBreakDuration] = useState<number>(
    getFromLocalStorage("longBreakDuration") || 15,
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
  const [totalSessionsCompleted, setTotalSessionsCompleted] = useState<number>(
    getFromLocalStorage("totalSessionsCompleted") || 0,
  );

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
    <CountdownSessionContext.Provider value={contextValue}>
      {children}
    </CountdownSessionContext.Provider>
  );
};

export const useSessionContext = () => {
  const sessionContext = useContext(CountdownSessionContext);

  if (!sessionContext) throw new Error("Session Context is undefined!");

  return sessionContext;
};
