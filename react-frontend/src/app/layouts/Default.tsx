import MusicPlayer from "@features/MusicPlayer/components/Index.tsx";
import Navbar from "@components/Navbar/Index.tsx";
import { Outlet } from "react-router";
import Sidebar from "@components/Sidebar/Index.tsx";

const DefaultLayout = () => {
    return (
        <>
            <Navbar />

            <Sidebar />

            <main
                className={
                    "bg-base-300 mt-(--navbar-height) ml-(--sidebar-width)"
                }
            >
                <Outlet />
            </main>

            <MusicPlayer />
        </>
    );
};

export default DefaultLayout;
