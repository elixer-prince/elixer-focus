import CurrentSessionType from "@features/CountdownTimer/SessionDisplay/CurrentSessionType";
import SessionSwitcher from "@features/CountdownTimer/SessionDisplay/SessionSwitcher/Index";

const CountdownTimerHeader = () => {
    return (
        // Countdown Timer Header
        <header
            className={
                "mt-8 flex flex-col items-center justify-center gap-x-2 gap-y-4"
            }
        >
            <CurrentSessionType />
            <SessionSwitcher />
        </header>
    );
};

export default CountdownTimerHeader;
