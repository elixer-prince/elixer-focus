import Sidebar from "@/features/ui/Sidebar/Index";
import useCountdownTimer from "@/hooks/countdown-timer/useCountdownTimer";
import { Outlet } from "react-router";

useCountdownTimer();

const Settings = () => {
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
