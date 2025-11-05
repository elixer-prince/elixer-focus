import type { ReactNode } from "react";
import Navbar from "../../components/Navbar/Navbar";

interface AppLayoutProps {
    children: ReactNode;
}

const AppLayout = ({ children }: AppLayoutProps) => {
    return (
        <>
            <Navbar />

            <main>{children}</main>

            <div>(Footer)</div>
        </>
    );
};

export default AppLayout;
