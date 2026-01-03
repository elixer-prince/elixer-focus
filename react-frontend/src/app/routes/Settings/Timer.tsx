import TimerSettings from "@features/CountdownTimer/TimerSettings/Index.tsx";
import { CountdownSessionProvider } from "@features/CountdownTimer/stores/SessionContext.tsx";
import { CountdownTimerProvider } from "@features/CountdownTimer/stores/CountdownTimerContext.tsx";

const Timer = () => {
    return (
        <CountdownSessionProvider>
            <CountdownTimerProvider>
                <TimerSettings />
            </CountdownTimerProvider>
        </CountdownSessionProvider>
    );
};

export default Timer;
