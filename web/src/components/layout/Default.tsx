import Navbar from "@/components/navigation/Navbar/Index";
import Sidebar from "@/components/navigation/Sidebar/Index";
import Modal from "@/components/ui/Modal";
import MusicPlayer from "@/features/music-player/components/Index";
import useCountdownTimer from "@/hooks/countdown-timer/useCountdownTimer";
import { Toaster } from "react-hot-toast";
import { Outlet } from "react-router";

const DefaultLayout = () => {
  useCountdownTimer();

  return (
    <>
      <Navbar />

      <Sidebar />

      <Toaster />

      <Modal />

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
