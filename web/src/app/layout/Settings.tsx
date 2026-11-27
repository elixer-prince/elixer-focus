import TimerModal from "@/features/countdown-timer/components/TimerModal";
import { startCalendarCoordinator } from "@/features/calendar/services/calendar-coordinator";
import SessionReflectionModal from "@/features/journal/components/SessionReflection/Modal";
import {
  startBrainDumpCoordinator,
  startSleepScheduleCoordinator,
} from "@/stores";
import Sidebar from "@/features/ui/navigation/Sidebar/Settings/components/Index";
import { useEffect } from "react";
import { Toaster } from "react-hot-toast";
import { Outlet } from "react-router";

const SettingsLayout = () => {
  useEffect(() => {
    const stopCalendarCoordinator = startCalendarCoordinator();
    const stopBrainDumpCoordinator = startBrainDumpCoordinator();
    const stopSleepScheduleCoordinator = startSleepScheduleCoordinator();

    return () => {
      stopCalendarCoordinator();
      stopBrainDumpCoordinator();
      stopSleepScheduleCoordinator();
    };
  }, []);

  return (
    <>
      <Sidebar />

      <Toaster />

      <TimerModal />

      <SessionReflectionModal />

      <main
        className={
          "mb-(--music-player-height) min-w-0 p-4 transition-colors duration-500 max-sm:mt-(--navbar-height) sm:ml-(--sidebar-width) sm:p-8"
        }
      >
        <Outlet />
      </main>
    </>
  );
};

export default SettingsLayout;
