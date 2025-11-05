import type { ReactNode } from "react";

interface AppLayoutProps {
    children: ReactNode;
}

const AppLayout = ({ children }: AppLayoutProps) => {
    return (
        <>
            <div>
                (Navbar)
                <div>(MusicPlayer)</div>
            </div>

            <main>{children}</main>

            <div>(Footer)</div>
        </>
    );
};

export default AppLayout;
