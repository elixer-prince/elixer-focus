import { CountdownTimerProvider } from "@features/countdown-timer/stores/TimerContext.tsx";
import CountdownButtonControls from "@features/countdown-timer/button-panel/ButtonPanel.tsx";
import FocusRing from "@features/countdown-timer/FocusRing.tsx";
import Header from "@features/countdown-timer/header/Header.tsx";
import { CountdownSessionProvider } from "@features/countdown-timer/stores/SessionContext.tsx";

const CountdownTimerContainer = () => {
    return (
        <CountdownTimerProvider>
            <CountdownSessionProvider>
                <section className="flex flex-col items-center justify-center gap-8 p-4">
                    <Header />

                    <FocusRing />

                    <CountdownButtonControls />
                </section>
            </CountdownSessionProvider>
        </CountdownTimerProvider>
    );
};

export default CountdownTimerContainer;
