import CountdownControls from "@features/CountdownTimer/components/ButtonControls/Index.tsx";
import CountdownHeader from "@features/CountdownTimer/components/SessionDisplay/Index.tsx";
import { CountdownTimerProvider } from "@features/CountdownTimer/stores/CountdownTimerContext.tsx";
import { CountdownSessionProvider } from "@features/CountdownTimer/stores/SessionContext.tsx";
import CountdownDisplay from "@features/CountdownTimer/components/TimerDisplay/Index.tsx";

const CountdownTimerContainer = () => {
    return (
        <CountdownTimerProvider>
            <CountdownSessionProvider>
                {/* Countdown Timer Section */}
                <section
                    className={
                        "ml-(--sidebar-width) flex flex-col items-center justify-center gap-8 p-4"
                    }
                >
                    <CountdownHeader />
                    <CountdownDisplay />
                    <CountdownControls />
                </section>
            </CountdownSessionProvider>
        </CountdownTimerProvider>
    );
};

export default CountdownTimerContainer;
