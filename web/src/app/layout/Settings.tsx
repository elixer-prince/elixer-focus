import Modal from "@/components/ui/Modal";
import Sidebar from "@/features/ui/navigation/Sidebar/Settings/components/Index";
import { Toaster } from "react-hot-toast";
import { Outlet } from "react-router";

const SettingsLayout = () => {
  return (
    <>
      <Sidebar />

      <Toaster />

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
