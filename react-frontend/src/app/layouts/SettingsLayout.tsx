import type { ReactNode } from "react";
import Footer from "@features/ui/Footer/Index.tsx";
import Sidebar from "@features/ui/Navigation/Sidebar/Index.tsx";

interface SettingsLayoutProps {
    children: ReactNode;
}

const SettingsLayout = ({ children }: SettingsLayoutProps) => {
    return (
        <>
            <Sidebar />

            <main className="ml-(--sidebar-width) p-8">{children}</main>

            <Footer className="ml-(--sidebar-width)" />
        </>
    );
};

export default SettingsLayout;
