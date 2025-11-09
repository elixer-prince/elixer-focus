import { CountdownTimerProvider } from "./CountdownTimerContext.tsx";
import { CountdownSessionProvider } from "";
import CountdownButtonControls from "./ButtonPanel/ButtonPanel.tsx";
import CountdownDisplay from "./Display.tsx";
import Header from "./Header.tsx";

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
