import SessionOption from "@/features/countdown-timer/components/SessionDisplay/SessionSwitcher/SessionOption";
import useSessionSwitch from "@/hooks/countdown-timer/useSessionSwitch";
import { useCurrentSessionType } from "@/stores/countdown-timer/session-store.ts";

const OptionsContainer = () => {
  const { switchToFocus, switchToShortBreak, switchToLongBreak } =
    useSessionSwitch();
  const currentSessionType = useCurrentSessionType();

  return (
    <ul
      tabIndex={-1}
      className={
        "dropdown-content menu bg-base-100 rounded-box z-1 w-52 p-2 shadow-sm"
      }
    >
      <li>
        <SessionOption
          value={"Focus"}
          onChange={switchToFocus}
          checked={currentSessionType === "Focus"}
        >
          Focus
        </SessionOption>
      </li>
      <li>
        <SessionOption
          value={"Short Break"}
          onChange={switchToShortBreak}
          checked={currentSessionType === "Short Break"}
        >
          Short Break
        </SessionOption>
      </li>
      <li>
        <SessionOption
          value={"Long Break"}
          onChange={switchToLongBreak}
          checked={currentSessionType === "Long Break"}
        >
          Long Break
        </SessionOption>
      </li>
    </ul>
  );
};

export default OptionsContainer;
