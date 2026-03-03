import SessionOption from "@/features/countdown-timer/components/TimerHeader/SessionSwitcher/SessionOption";
import useSessionSwitch from "@/features/countdown-timer/hooks/useSessionSwitch";
import { useCurrentSessionType } from "@/features/countdown-timer/stores/session-store";

const OptionsContainer = () => {
  const {
    switchToFocus,
    switchToShortBreak,
    switchToLongBreak,
    switchToCustom,
  } = useSessionSwitch();
  const currentSessionType = useCurrentSessionType();

  return (
    <ul
      tabIndex={-1}
      className="session-switcher__options-container dropdown-content menu bg-base-100 rounded-box z-20 w-52 p-2 shadow-sm"
    >
      <li>
        <SessionOption
          value="Focus"
          onChange={switchToFocus}
          checked={currentSessionType === "Focus"}
        >
          Focus
        </SessionOption>
      </li>
      <li>
        <SessionOption
          value="Short Break"
          onChange={switchToShortBreak}
          checked={currentSessionType === "Short Break"}
        >
          Short Break
        </SessionOption>
      </li>
      <li>
        <SessionOption
          value="Long Break"
          onChange={switchToLongBreak}
          checked={currentSessionType === "Long Break"}
        >
          Long Break
        </SessionOption>
      </li>
      <li>
        <SessionOption
          value="Custom Session"
          onChange={switchToCustom}
          checked={currentSessionType === "Custom"}
        >
          Custom
        </SessionOption>
      </li>
    </ul>
  );
};

export default OptionsContainer;
