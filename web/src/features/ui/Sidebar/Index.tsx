import NavLogo from "@/components/navigation/NavLogo";
import LinkContainer from "@/features/ui/Sidebar/LinkContainer";
import { GoSidebarExpand } from "react-icons/go";

const Sidebar = () => {
  return (
    <nav className="sidebar sm:bg-base-100/25 fixed top-0 left-0 z-10 w-full items-center p-4 backdrop-blur-sm max-sm:h-(--navbar-height) max-sm:border-b-2 sm:bottom-0 sm:w-(--sidebar-width)">
      <div className={"flex items-center justify-between"}>
        <NavLogo />

        <div className={"cursor-pointer max-sm:hidden"}>
          <GoSidebarExpand size={24} />
        </div>
      </div>

      <LinkContainer />
    </nav>
  );
};

export default Sidebar;
