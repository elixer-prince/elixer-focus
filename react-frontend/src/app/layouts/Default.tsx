import Navbar from "@/components/Navigation/Navbar/Index";
import Sidebar from "@/components/Navigation/Sidebar/Index";
import MusicPlayer from "@/features/MusicPlayer/components/Index";
import useCountdownTimer from "@/hooks/countdown-timer/useCountdownTimer";
import { Toaster } from "react-hot-toast";
import { Outlet } from "react-router";

useCountdownTimer();

const DefaultLayout = () => {
  return (
    <>
      <Navbar />

      <Sidebar />

      <Toaster />

      <main
        className={
          "bg-base-300 mt-(--navbar-height) mb-(--music-player-height) md:ml-(--sidebar-width)"
        }
      >
        <Outlet />
      </main>

      <MusicPlayer />
    </>
  );
};

export default DefaultLayout;
