import { SessionContext } from "@features/CountdownTimer/stores/SessionContext.tsx";
import { useContext } from "react";

const UseSessionContext = () => {
    const sessionContext = useContext(SessionContext);

    if (!sessionContext) throw new Error("Session Context is undefined!");

    return sessionContext;
};

export default UseSessionContext;
