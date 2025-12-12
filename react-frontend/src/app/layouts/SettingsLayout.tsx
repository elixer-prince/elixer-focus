import type { ReactNode } from "react";
import Navbar from "@features/ui/navbar/Navbar";
import Footer from "@features/ui/footer/Footer";

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
