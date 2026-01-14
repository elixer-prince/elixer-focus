import Sidebar from "@features/ui/Navigation/Sidebar/Index.tsx";
import { Outlet } from "react-router";

const SettingsLayout = () => {
    return (
        <>
            <Sidebar />

            <main className={"ml-(--sidebar-width) p-8"}>
                <Outlet />
            </main>
        </>
    );
};

export default SettingsLayout;
