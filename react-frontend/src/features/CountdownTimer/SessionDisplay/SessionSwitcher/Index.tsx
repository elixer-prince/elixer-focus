import OptionsContainer from "@features/CountdownTimer/SessionDisplay/SessionSwitcher/OptionsContainer.tsx";
import DropdownButton from "@features/CountdownTimer/SessionDisplay/SessionSwitcher/DropdownButton.tsx";

const SessionSwitcher = () => {
    return (
        <div className="dropdown dropdown-center">
            <DropdownButton />
            <OptionsContainer />
        </div>
    );
};

export default SessionSwitcher;
