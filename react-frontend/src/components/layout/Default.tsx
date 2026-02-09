import Navbar from "@/components/navigation/Navbar/Index.tsx";
import Sidebar from "@/components/navigation/Sidebar/Index.tsx";
import MusicPlayer from "@/features/music-player/components/Index.tsx";
import useCountdownTimer from "@/hooks/countdown-timer/useCountdownTimer.ts";
import { Toaster } from "react-hot-toast";
import { Outlet } from "react-router";

const DefaultLayout = () => {
  useCountdownTimer();

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
