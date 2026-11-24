import TimerModal from "@/features/countdown-timer/components/TimerModal";
import SessionReflectionModal from "@/features/journal/components/SessionReflection/Modal";
import Sidebar from "@/features/ui/navigation/Sidebar/Settings/components/Index";
import { Toaster } from "react-hot-toast";
import { Outlet } from "react-router";

const SettingsLayout = () => {
  return (
    <>
      <Sidebar />

      <Toaster />

      <TimerModal />

      <SessionReflectionModal />

      <main
        className={
          "mb-(--music-player-height) p-8 transition-colors duration-500 max-sm:mt-(--navbar-height) sm:ml-(--sidebar-width)"
        }
      >
        <Outlet />
      </main>
    </>
  );
};

export default SettingsLayout;
