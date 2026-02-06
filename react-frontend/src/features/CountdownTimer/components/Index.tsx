import ButtonControls from "@/features/CountdownTimer/components/ButtonControls/Index.tsx";
import CountdownHeader from "@/features/CountdownTimer/components/SessionDisplay/Index.tsx";
import CountdownDisplay from "@/features/CountdownTimer/components/TimerDisplay/Index.tsx";
import { CountdownTimerProvider } from "@/features/CountdownTimer/stores/CountdownTimerContext.tsx";
import { CountdownSessionProvider } from "@/features/CountdownTimer/stores/SessionContext.tsx";

const CountdownTimerContainer = () => {
    return (
        <CountdownTimerProvider>
            <CountdownSessionProvider>
                {/* Countdown Timer Section */}
                <section
                    className={
                        "flex w-150 flex-col items-center justify-center gap-4 rounded-xl p-4"
                    }
                >
                    <CountdownHeader />
                    <CountdownDisplay />
                    <ButtonControls />
                </section>
            </CountdownSessionProvider>
        </CountdownTimerProvider>
    );
};

export default CountdownTimerContainer;
