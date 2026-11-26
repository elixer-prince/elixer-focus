import TimerModal from "@/features/countdown-timer/components/TimerModal";
import { startCalendarCoordinator } from "@/features/calendar/services/calendar-coordinator";
import SessionReflectionModal from "@/features/journal/components/SessionReflection/Modal";
import { startSleepScheduleCoordinator } from "@/stores";
import Navbar from "@/features/ui/navigation/Navbar/components/Index";
import Sidebar from "@/features/ui/navigation/Sidebar/Default/components/Index";
import { useEffect } from "react";
import { Toaster } from "react-hot-toast";
import { Outlet } from "react-router";

const DefaultLayout = () => {
  useEffect(() => {
    const stopCalendarCoordinator = startCalendarCoordinator();
    const stopSleepScheduleCoordinator = startSleepScheduleCoordinator();

    return () => {
      stopCalendarCoordinator();
      stopSleepScheduleCoordinator();
    };
  }, []);

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
