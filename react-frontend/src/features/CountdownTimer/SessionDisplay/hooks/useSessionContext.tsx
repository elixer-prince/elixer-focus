import { useContext } from "react";
import { SessionContext } from "@features/CountdownTimer/SessionDisplay/stores/SessionContext.tsx";

const UseSessionContext = () => {
    const sessionContext = useContext(SessionContext);

    if (!sessionContext) throw new Error("Session Context is undefined!");

    return sessionContext;
};

export default UseSessionContext;
