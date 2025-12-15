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

            <main className="ml-(--sidebar-width)">{children}</main>

            <Footer />
        </>
    );
};

export default SettingsLayout;
