import useSessionContext from "@features/CountdownTimer/hooks/useSessionContext.tsx";
import SessionOption from "@features/CountdownTimer/SessionDisplay/SessionSwitcher/SessionOption.tsx";
import useSessionSwitch from "@features/CountdownTimer/hooks/useSessionSwitch.tsx";

const SessionSwitcher = () => {
    const { switchToFocus, switchToShortBreak, switchToLongBreak } =
        useSessionSwitch();

    const { currentSessionType } = useSessionContext();

    return (
        <div className="dropdown">
            <div tabIndex={0} role="button" className="btn btn-soft m-1">
                Switch Session
            </div>
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
