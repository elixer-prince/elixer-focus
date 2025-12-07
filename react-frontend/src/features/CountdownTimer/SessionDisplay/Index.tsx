import SessionSwitcher from "@features/CountdownTimer/SessionDisplay/SessionSwitcher/Index.tsx";
import SessionTypeHeader from "@features/CountdownTimer/SessionDisplay/SessionTypeHeader.tsx";

const CountdownTimerHeader = () => {
    return (
        <header className="mt-8 flex items-center">
            <SessionTypeHeader />
            <SessionSwitcher />
        </header>
    );
};

export default CountdownTimerHeader;
