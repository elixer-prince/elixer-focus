import CurrentSessionType from "@features/CountdownTimer/components/SessionDisplay/CurrentSessionType.tsx";
import SessionSwitcher from "@features/CountdownTimer/components/SessionDisplay/SessionSwitcher/Index.tsx";
import { timerHeaderStyles } from "@features/CountdownTimer/components/SessionDisplay/styles.ts";

const CountdownTimerHeader = () => {
    return (
        <header className={timerHeaderStyles}>
            <CurrentSessionType />
            <SessionSwitcher />
        </header>
    );
};

export default CountdownTimerHeader;
