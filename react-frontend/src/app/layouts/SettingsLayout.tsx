import Footer from "@features/ui/Footer/Index.tsx";
import Sidebar from "@features/ui/Navigation/Sidebar/Index.tsx";
import { Outlet } from "react-router";

const SettingsLayout = () => {
    return (
        <>
            <Sidebar />

            <main className="ml-(--sidebar-width) p-8">
                <Outlet />
            </main>

            <Footer className="ml-(--sidebar-width)" />
        </>
    );
};

export default SettingsLayout;
