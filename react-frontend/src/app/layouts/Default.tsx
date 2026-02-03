import MusicPlayer from "@features/MusicPlayer/Index.tsx";
import Navbar from "@features/ui/Navigation/Navbar/Index.tsx";
import { Outlet } from "react-router";

const DefaultLayout = () => {
    return (
        <>
            {/* Main App Wrapper */}
            <div className={"mb-(--music-player-height)"}>
                <Navbar />

                <main className={"bg-base-300 mt-(--navbar-height)"}>
                    <Outlet />
                </main>
            </div>

            <MusicPlayer />
        </>
    );
};

export default DefaultLayout;
