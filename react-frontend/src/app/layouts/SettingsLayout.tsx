import Sidebar from "@features/ui/Navigation/Sidebar/Index.tsx";
import { Outlet } from "react-router";

const SettingsLayout = () => {
    return (
        <>
            <Sidebar />

            <main
                className={
                    "p-8 max-sm:mt-(--navbar-height) sm:ml-(--sidebar-width)"
                }
            >
                <Outlet />
            </main>
        </>
    );
};

export default SettingsLayout;
