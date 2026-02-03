import MusicPlayer from "@features/MusicPlayer/Index.tsx";
import Navbar from "@features/ui/Navigation/Navbar/Index.tsx";
import { Outlet } from "react-router";

const DefaultLayout = () => {
    return (
        <>
            <Navbar />

            <main className={"bg-base-300 mt-(--navbar-height)"}>
                <Outlet />
            </main>

            <MusicPlayer />
        </>
    );
};

export default DefaultLayout;
