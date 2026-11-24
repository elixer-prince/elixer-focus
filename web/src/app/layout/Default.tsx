import TimerModal from "@/features/countdown-timer/components/TimerModal";
import SessionReflectionModal from "@/features/journal/components/SessionReflection/Modal";
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

      <SessionReflectionModal />

      <main className="main mt-(--navbar-height) mb-(--music-player-height) transition-colors duration-500 md:ml-(--sidebar-width)">
        <Outlet />
      </main>
    </>
  );
};

export default DefaultLayout;
