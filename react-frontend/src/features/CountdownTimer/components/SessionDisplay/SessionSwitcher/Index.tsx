import OptionsContainer from "@features/CountdownTimer/components/SessionDisplay/SessionSwitcher/OptionsContainer.tsx";
import DropdownButton from "@features/CountdownTimer/components/SessionDisplay/SessionSwitcher/DropdownButton.tsx";
import { sessionSwitcherStyles } from "@features/CountdownTimer/components/SessionDisplay/styles.ts";

const SessionSwitcher = () => {
    return (
        <div className={sessionSwitcherStyles}>
            <DropdownButton />
            <OptionsContainer />
        </div>
    );
};

export default SessionSwitcher;
