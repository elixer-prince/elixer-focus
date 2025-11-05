import { CountdownTimerProvider } from "../../contexts/CountdownTimer/CountdownTimerContext";
import { SessionProvider } from "../../contexts/SessionContext";
import CountdownButtonControls from "./ButtonPanel/ButtonPanel";
import CountdownDisplay from "./Display";

const CountdownTimerContainer = () => {
    return (
        <CountdownTimerProvider>
            <SessionProvider>
                <section className="flex min-h-screen flex-col items-center justify-center gap-8 p-4">
                    {/* <CountdownTimerHeader
                currentSessionType={currentSessionType}
                setCurrentSessionType={setCurrentSessionType}
                currentSessionCount={currentSessionCount}
                sessionCountLimit={sessionCountLimit}
                totalSessionsCompleted={totalSessionsCompleted}
            /> */}
                    <header>
                        <p className="text-4xl font-bold">Focus Session</p>
                    </header>

                    <CountdownDisplay />

                    <CountdownButtonControls />
                </section>
            </SessionProvider>
        </CountdownTimerProvider>
    );
};

export default CountdownTimerContainer;
