import SessionOption from "@/features/countdown-timer/components/TimerHeader/SessionSwitcher/SessionOption";
import useSessionSwitch from "@/features/countdown-timer/hooks/useSessionSwitch";
import { useCurrentSessionType } from "@/features/countdown-timer/stores/session-store";
import { useLastCompletedSession } from "@/features/countdown-timer/stores/session-history-store";

const OptionsContainer = () => {
  const { switchToFocus, switchToShortBreak, switchToLongBreak } =
    useSessionSwitch();
  const currentSessionType = useCurrentSessionType();
  const lastCompletedSession = useLastCompletedSession();

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
          disabled={lastCompletedSession !== null}
        >
          Focus
        </SessionOption>
      </li>
      <li>
        <SessionOption
          value="Short Break"
          onChange={switchToShortBreak}
          checked={currentSessionType === "Short Break"}
          disabled={lastCompletedSession !== null}
        >
          Short Break
        </SessionOption>
      </li>
      <li>
        <SessionOption
          value="Long Break"
          onChange={switchToLongBreak}
          checked={currentSessionType === "Long Break"}
          disabled={lastCompletedSession !== null}
        >
          Long Break
        </SessionOption>
      </li>
    </ul>
  );
};

export default OptionsContainer;
