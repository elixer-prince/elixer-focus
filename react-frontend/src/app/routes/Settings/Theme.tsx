import SettingsLayout from "@app/layouts/SettingsLayout.tsx";
import ThemeSettings from "@features/Settings/ThemeSettings/Index.tsx";

const Theme = () => {
    return (
        <SettingsLayout>
            <ThemeSettings />
        </SettingsLayout>
    );
};

export default Theme;
