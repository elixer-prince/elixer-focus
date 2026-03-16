import NavLogo from "@/features/ui/navigation/NavLogo";
import LinkContainer from "@/features/ui/navigation/Sidebar/Settings/components/LinkContainer";
import { GoSidebarExpand } from "react-icons/go";

const Sidebar = () => {
  return (
    // Settings Sidebar
    <nav className="sm:bg-base-100/25 border-r-base-content/50 fixed top-0 left-0 z-10 w-full items-center border-r px-4 py-5.5 backdrop-blur-sm select-none max-sm:h-(--navbar-height) max-sm:border-b-2 sm:bottom-0 sm:w-(--sidebar-width)">
      <header className="mb-6 flex items-center justify-between">
        <NavLogo />

        <div className="cursor-pointer max-sm:hidden">
          <GoSidebarExpand size={24} />
        </div>
      </header>

      <LinkContainer />
    </nav>
  );
};

export default Sidebar;
