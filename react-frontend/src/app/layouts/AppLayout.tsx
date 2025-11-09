import type {ReactNode} from "react";
import Navbar from "@features/ui/navbar/Navbar;
import Footer from "@features/ui/footer/Footer";

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
