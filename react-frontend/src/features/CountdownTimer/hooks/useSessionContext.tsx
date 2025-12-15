import { CountdownSessionContext } from "@features/CountdownTimer/stores/SessionContext.tsx";
import { useContext } from "react";

const useSessionContext = () => {
    const sessionContext = useContext(CountdownSessionContext);

    if (!sessionContext) throw new Error("Session Context is undefined!");

    return sessionContext;
};

export default useSessionContext;
