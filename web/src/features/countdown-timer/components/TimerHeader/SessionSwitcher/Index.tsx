import DropdownButton from "@/features/countdown-timer/components/TimerHeader/SessionSwitcher/DropdownToggle";
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
