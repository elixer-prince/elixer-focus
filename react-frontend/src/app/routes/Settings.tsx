import SettingsLayout from "@app/layouts/SettingsLayout.tsx";
import ThemeSettings from "@features/ThemeSettings/Index.tsx";

const Settings = () => {
    return (
        <SettingsLayout>
            <ThemeSettings />
        </SettingsLayout>
    );
};

export default Settings;
