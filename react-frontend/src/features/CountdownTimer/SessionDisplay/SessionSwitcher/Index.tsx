import OptionsContainer from "@features/CountdownTimer/SessionDisplay/SessionSwitcher/OptionsContainer";
import DropdownButton from "@features/CountdownTimer/SessionDisplay/SessionSwitcher/DropdownButton";

const SessionSwitcher = () => {
    return (
        <div className="dropdown dropdown-center">
            <DropdownButton />
            <OptionsContainer />
        </div>
    );
};

export default SessionSwitcher;
