import DropdownButton from "@/features/CountdownTimer/components/SessionDisplay/SessionSwitcher/DropdownButton";
import OptionsContainer from "@/features/CountdownTimer/components/SessionDisplay/SessionSwitcher/OptionsContainer.tsx";

const SessionSwitcher = () => {
  return (
    <div className={"dropdown dropdown-center"}>
      <DropdownButton />
      <OptionsContainer />
    </div>
  );
};

export default SessionSwitcher;
