import MusicPlayer from "@features/MusicPlayer/Index.tsx";
import Footer from "@features/ui/Footer/Index.tsx";
import Navbar from "@features/ui/Navigation/Navbar/Index.tsx";
import { type ReactNode } from "react";

interface AppLayoutProps {
    children: ReactNode;
}

const SimpleLayout = ({ children }: AppLayoutProps) => {
    return (
        <>
            {/* Main App Wrapper */}
            <div className="mb-(--music-player-height)">
                <Navbar />

                <main className="bg-base-300 mt-(--navbar-height)">
                    {children}
                </main>

                <Footer />
            </div>

            <MusicPlayer />
        </>
    );
};

export default SimpleLayout;
