import type { ReactNode } from "react";
import Navbar from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer/Footer.tsx";

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
