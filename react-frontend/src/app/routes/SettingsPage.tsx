import ThemeSettings from "@features/theme-settings/ThemeSettings";
import AppLayout from "../layouts/AppLayout.tsx";

const SettingsPage = () => {
    return (
        <AppLayout>
            <ThemeSettings />
        </AppLayout>
    );
};

export default SettingsPage;
