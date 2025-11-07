import { CountdownTimerProvider } from "../../contexts/CountdownTimerContext";
import { CountdownSessionProvider } from "../../contexts/CountdownSessionContext";
import CountdownButtonControls from "./ButtonPanel/ButtonPanel";
import CountdownDisplay from "./Display";
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
