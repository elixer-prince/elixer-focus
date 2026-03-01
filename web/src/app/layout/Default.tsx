import Modal from "@/components/ui/Modal";
import MusicPlayer from "@/features/music-player/components/Index";
import Navbar from "@/features/ui/navigation/Navbar/Index";
import Sidebar from "@/features/ui/navigation/Sidebar/Default/Index";
import useCountdownTimer from "@/features/countdown-timer/hooks/useCountdownTimer";
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

      <main className="main mt-(--navbar-height) mb-(--music-player-height) md:ml-(--sidebar-width)">
        <Outlet />
      </main>

      <MusicPlayer />
    </>
  );
};

export default DefaultLayout;
