import type { ReactNode } from "react";
import Navbar from "@features/ui/Navbar/Index.tsx";
import Footer from "@features/ui/Footer/Index.tsx";

interface AppLayoutProps {
    children: ReactNode;
}

const AppLayout = ({ children }: AppLayoutProps) => {
    return (
        <>
            <Navbar />

            <main>{children}</main>

            <Footer />
        </>
    );
};

export default AppLayout;
