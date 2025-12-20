import useSessionContext from "@features/CountdownTimer/hooks/useSessionContext.tsx";
import SessionOption from "@features/CountdownTimer/SessionDisplay/SessionSwitcher/SessionOption.tsx";
import useSessionSwitch from "@features/CountdownTimer/hooks/useSessionSwitch.tsx";
import { FiChevronDown } from "react-icons/fi";

const SessionSwitcher = () => {
    const { switchToFocus, switchToShortBreak, switchToLongBreak } =
        useSessionSwitch();

    const { currentSessionType } = useSessionContext();

    return (
        <div className="dropdown dropdown-center">
            <div tabIndex={0} role="button" className="btn btn-soft btn-ghost">
                Switch Session
                <FiChevronDown size={20} />
            </div>

            {/* Dropdown Options */}
            <ul
                tabIndex={-1}
                className="dropdown-content menu bg-base-100 rounded-box z-1 w-52 p-2 shadow-sm"
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
            </ul>
        </div>
    );
};

export default SessionSwitcher;
