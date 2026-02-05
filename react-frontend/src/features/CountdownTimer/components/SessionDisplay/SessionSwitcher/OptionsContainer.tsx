import useSessionSwitch from "@features/CountdownTimer/hooks/CountdownSession/useSessionSwitch.ts";
import SessionOption from "@features/CountdownTimer/components/SessionDisplay/SessionSwitcher/SessionOption.tsx";
import { useSessionContext } from "@features/CountdownTimer/stores/SessionContext.tsx";
import { optionsContainerStyles } from "@features/CountdownTimer/components/SessionDisplay/styles.ts";

const OptionsContainer = () => {
    const { switchToFocus, switchToShortBreak, switchToLongBreak } =
        useSessionSwitch();
    const { currentSessionType } = useSessionContext();

    return (
        <ul tabIndex={-1} className={optionsContainerStyles}>
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
