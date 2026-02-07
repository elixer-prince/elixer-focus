import HamburgerMenu from "@/components/Navigation/Navbar/HamburgerMenu";
import LoginLink from "@/components/Navigation/Navbar/LoginLink";
import {
  NavbarProvider,
  useNavbarContext,
} from "@/components/Navigation/Navbar/stores/NavbarContext";
import NavLogo from "@/components/Navigation/NavLogo";

const NavbarContent = () => {
  const { isOpen } = useNavbarContext();

  return (
    // Navbar Content
    <nav
      className={`${isOpen ? "max-md:bg-base-300 max-md:h-screen" : ""} border-b-base-content/50 fixed top-0 right-0 left-0 z-20 h-(--navbar-height) border-b p-4 shadow-md backdrop-blur-sm transition-all duration-1000`.trim()}
    >
      {/* Inner Navbar Container */}
      <div className={"flex h-10 w-full items-center justify-between"}>
        {/* Left Container */}
        <div className={"flex items-center gap-2"}>
          <HamburgerMenu />

          <div className={"flex items-baseline gap-8"}>
            <NavLogo />
          </div>
        </div>

        {/* Right Container */}
        <div className={"flex items-center gap-4"}>
          {/*    <BrainDumpIcon />*/}
          {/*<SettingsIcon />*/}
          <LoginLink />
          {/*    <ProfileAvatar />*/}
        </div>
      </div>
    </nav>
  );
};

const Navbar = () => {
  return (
    <NavbarProvider>
      <NavbarContent />
    </NavbarProvider>
  );
};

export default Navbar;
