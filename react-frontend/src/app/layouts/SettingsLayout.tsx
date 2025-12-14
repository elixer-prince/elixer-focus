import type { ReactNode } from "react";
import Navbar from "@features/ui/Navbar/Index.tsx";
import Footer from "@features/ui/Footer/Index.tsx";

interface SettingsLayoutProps {
    children: ReactNode;
}

const SettingsLayout = ({ children }: SettingsLayoutProps) => {
    return (
        <>
            <Navbar />

            <main>{children}</main>

            <Footer />
        </>
    );
};

export default SettingsLayout;
