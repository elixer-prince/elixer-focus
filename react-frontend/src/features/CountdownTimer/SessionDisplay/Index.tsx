import SessionSwitcher from "@features/CountdownTimer/SessionDisplay/SessionSwitcher/Index.tsx";
import SessionTypeHeader from "@features/CountdownTimer/SessionDisplay/SessionTypeHeader.tsx";

const CountdownTimerHeader = () => {
    return (
        <header className="mt-8 flex flex-col items-center justify-center gap-x-2 gap-y-4">
            <SessionTypeHeader />
            <SessionSwitcher />
        </header>
    );
};

export default CountdownTimerHeader;
