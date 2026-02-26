import DropdownButton from "@/features/countdown-timer/components/TimerHeader/SessionSwitcher/DropdownButton";
import OptionsContainer from "@/features/countdown-timer/components/TimerHeader/SessionSwitcher/OptionsContainer";

const SessionSwitcher = () => {
  return (
    <div className="session-switcher dropdown dropdown-center">
      <DropdownButton />
      <OptionsContainer />
    </div>
  );
};

export default SessionSwitcher;
