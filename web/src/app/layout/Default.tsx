import TimerModal from "@/features/countdown-timer/components/TimerModal";
import Navbar from "@/features/ui/navigation/Navbar/components/Index";
import Sidebar from "@/features/ui/navigation/Sidebar/Default/components/Index";
import { Toaster } from "react-hot-toast";
import { Outlet } from "react-router";

const DefaultLayout = () => {
  return (
    <>
      <Navbar />

      <Sidebar />

      <Toaster />

      <TimerModal />

      <main className="main mt-(--navbar-height) mb-(--music-player-height) transition-colors duration-500 md:ml-(--sidebar-width)">
        <Outlet />
      </main>
    </>
  );
};

export default DefaultLayout;
