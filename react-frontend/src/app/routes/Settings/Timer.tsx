import TimerSettings from "@features/Settings/TimerSettings/Index.tsx";
import SettingsLayout from "@app/layouts/SettingsLayout.tsx";

const Timer = () => {
    return (
        <SettingsLayout>
            <TimerSettings />
        </SettingsLayout>
    );
};

export default Timer;
