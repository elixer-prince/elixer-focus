import { CountdownTimerProvider } from "@features/countdown-timer/CountdownTimerContext";
import CountdownButtonControls from "@features/countdown-timer/button-panel/ButtonPanel";
import CountdownDisplay from "@features/countdown-timer/Display";
import Header from "@features/countdown-timer/Header";
import { CountdownSessionProvider } from "@features/countdown-timer/CountdownSessionContext";

const CountdownTimerContainer = () => {
    return (
        <CountdownTimerProvider>
            <CountdownSessionProvider>
                <section className="flex flex-col items-center justify-center gap-8 p-4">
                    <Header />

                    <CountdownDisplay />

                    <CountdownButtonControls />
                </section>
            </CountdownSessionProvider>
        </CountdownTimerProvider>
    );
};

export default CountdownTimerContainer;
