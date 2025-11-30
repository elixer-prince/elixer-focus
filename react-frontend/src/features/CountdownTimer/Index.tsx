import { CountdownTimerProvider } from "@features/CountdownTimer/stores/CountdownTimerContext.tsx";
import CountdownControls from "@features/CountdownTimer/ButtonControls/Index.tsx";
import CountdownDisplay from "@features/CountdownTimer/CountdownDisplay/Index.tsx";
import CountdownHeader from "@features/CountdownTimer/SessionDisplay/Index.tsx";
import { CountdownSessionProvider } from "@features/CountdownTimer/SessionDisplay/stores/SessionContext.tsx";

const CountdownTimerContainer = () => {
    return (
        <CountdownTimerProvider>
            <CountdownSessionProvider>
                <section className="flex flex-col items-center justify-center gap-8 border-red-500 p-4">
                    <CountdownHeader />

                    <CountdownDisplay />

                    <CountdownControls />
                </section>
            </CountdownSessionProvider>
        </CountdownTimerProvider>
    );
};

export default CountdownTimerContainer;
