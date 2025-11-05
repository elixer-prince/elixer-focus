import AppLayout from "./layouts/AppLayout";

const SettingsPage = () => {
    return (
        <AppLayout>
            <fieldset className="fieldset">
                <label className="flex cursor-pointer items-center gap-2">
                    <input
                        type="radio"
                        name="theme-radios"
                        className="radio radio-sm theme-controller"
                        value="default"
                    />
                    Default
                </label>
                <label className="flex cursor-pointer items-center gap-2">
                    <input
                        type="radio"
                        name="theme-radios"
                        className="radio radio-sm theme-controller"
                        value="luxury"
                    />
                    Luxury
                </label>
                <label className="flex cursor-pointer items-center gap-2">
                    <input
                        type="radio"
                        name="theme-radios"
                        className="radio radio-sm theme-controller"
                        value="retro"
                    />
                    Retro
                </label>
                <label className="flex cursor-pointer items-center gap-2">
                    <input
                        type="radio"
                        name="theme-radios"
                        className="radio radio-sm theme-controller"
                        value="cyberpunk"
                    />
                    Cyberpunk
                </label>
                <label className="flex cursor-pointer items-center gap-2">
                    <input
                        type="radio"
                        name="theme-radios"
                        className="radio radio-sm theme-controller"
                        value="valentine"
                    />
                    Valentine
                </label>
                <label className="flex cursor-pointer items-center gap-2">
                    <input
                        type="radio"
                        name="theme-radios"
                        className="radio radio-sm theme-controller"
                        value="aqua"
                    />
                    Aqua
                </label>
            </fieldset>
        </AppLayout>
    );
};

export default SettingsPage;
