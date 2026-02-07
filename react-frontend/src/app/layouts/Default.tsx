import Navbar from "@/components/Navigation/Navbar/Index";
import Sidebar from "@/components/Navigation/Sidebar/Index";
import MusicPlayer from "@/features/MusicPlayer/components/Index";
import { Outlet } from "react-router";

const DefaultLayout = () => {
  return (
    <>
      <Navbar />

      <Sidebar />

      <main
        className={"bg-base-300 mt-(--navbar-height) md:ml-(--sidebar-width)"}
      >
        <Outlet />
      </main>

      <MusicPlayer />
    </>
  );
};

export default DefaultLayout;
