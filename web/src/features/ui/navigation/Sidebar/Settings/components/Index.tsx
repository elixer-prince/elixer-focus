import NavLogo from "@/features/ui/navigation/NavLogo";
import LinkContainer from "@/features/ui/navigation/Sidebar/Settings/components/LinkContainer";
import SettingsMobileNavigation from "@/features/ui/navigation/Sidebar/Settings/components/SettingsMobileNavigation";

const Sidebar = () => {
  return (
    // Settings Sidebar
    <nav
      aria-label="Settings navigation"
      className="sm:bg-base-100/25 border-r-base-content/50 max-sm:border-b-base-content/50 fixed top-0 left-0 z-10 flex h-(--navbar-height) w-full items-center justify-between border-r border-b px-4 backdrop-blur-sm transition-colors duration-500 select-none sm:bottom-0 sm:block sm:h-auto sm:w-(--sidebar-width) sm:border-b-0 sm:py-5.5"
    >
      <header className="flex w-full items-center justify-between max-sm:h-full sm:mb-6">
        <div className="flex items-center gap-2">
          <SettingsMobileNavigation />
          <NavLogo />
        </div>
      </header>

      <LinkContainer />
    </nav>
  );
};

export default Sidebar;
