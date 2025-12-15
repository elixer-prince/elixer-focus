import TimerSettings from "@features/CountdownTimer/TimerSettings/Index.tsx";
import SettingsLayout from "@app/layouts/SettingsLayout.tsx";
import { CountdownSessionProvider } from "@features/CountdownTimer/stores/SessionContext.tsx";
import { CountdownTimerProvider } from "@features/CountdownTimer/stores/CountdownTimerContext.tsx";

const Timer = () => {
    return (
        <CountdownSessionProvider>
            <CountdownTimerProvider>
                <SettingsLayout>
                    <TimerSettings />
                </SettingsLayout>
            </CountdownTimerProvider>
        </CountdownSessionProvider>
    );
};

export default Timer;
