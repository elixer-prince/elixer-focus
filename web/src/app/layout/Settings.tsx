import TimerModal from "@/features/countdown-timer/components/TimerModal";
import { startCalendarCoordinator } from "@/features/calendar/services/calendar-coordinator";
import SessionReflectionModal from "@/features/journal/components/SessionReflection/Modal";
import Sidebar from "@/features/ui/navigation/Sidebar/Settings/components/Index";
import { useEffect } from "react";
import { Toaster } from "react-hot-toast";
import { Outlet } from "react-router";

const SettingsLayout = () => {
  useEffect(() => startCalendarCoordinator(), []);

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
