import Modal from "@/components/ui/Modal";
import Sidebar from "@/features/ui/navigation/Sidebar/Settings/components/Index";
import { Outlet } from "react-router";

const SettingsLayout = () => {
  return (
    <>
      <Sidebar />

      <Modal />

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
