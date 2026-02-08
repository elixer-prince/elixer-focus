import CurrentSessionType from "@/features/CountdownTimer/components/SessionDisplay/CurrentSessionType";
import SessionSwitcher from "@/features/CountdownTimer/components/SessionDisplay/SessionSwitcher/Index";

const CountdownTimerHeader = () => {
    return (
        <header
            className={"mt-8 flex flex-col items-center justify-center gap-4"}
        >
            <CurrentSessionType />
            <SessionSwitcher />
        </header>
    );
};

export default CountdownTimerHeader;
