import DropdownButton from "@/features/countdown-timer/components/SessionDisplay/SessionSwitcher/DropdownButton";
import OptionsContainer from "@/features/countdown-timer/components/SessionDisplay/SessionSwitcher/OptionsContainer";

const SessionSwitcher = () => {
  return (
    <div className={"dropdown dropdown-center"}>
      <DropdownButton />
      <OptionsContainer />
    </div>
  );
};

export default SessionSwitcher;
