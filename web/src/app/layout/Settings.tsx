import Sidebar from "@/features/ui/navigation/Sidebar/Settings/Index";
import useCountdownTimer from "@/features/countdown-timer/hooks/useCountdownTimer";
import { Outlet } from "react-router";

const Settings = () => {
  useCountdownTimer();

  return (
    <>
      <Sidebar />

      <main
        className={"p-8 max-sm:mt-(--navbar-height) sm:ml-(--sidebar-width)"}
      >
        <Outlet />
      </main>
    </>
  );
};

export default Settings;
