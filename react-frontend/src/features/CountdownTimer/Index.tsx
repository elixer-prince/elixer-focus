import CountdownControls from "@features/CountdownTimer/ButtonControls/Index";
import CountdownHeader from "@features/CountdownTimer/SessionDisplay/Index";
import { CountdownTimerProvider } from "@features/CountdownTimer/stores/CountdownTimerContext";
import { CountdownSessionProvider } from "@features/CountdownTimer/stores/SessionContext";
import CountdownDisplay from "@features/CountdownTimer/TimerDisplay/Index";

const CountdownTimerContainer = () => {
    return (
        <CountdownTimerProvider>
            <CountdownSessionProvider>
                {/* Countdown Timer Section */}
                <section className="flex flex-col items-center justify-center gap-8 border border-red-500 p-4">
                    <CountdownHeader />
                    <CountdownDisplay />
                    <CountdownControls />
                </section>
            </CountdownSessionProvider>
        </CountdownTimerProvider>
    );
};

export default CountdownTimerContainer;
