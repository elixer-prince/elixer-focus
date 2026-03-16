import CurrentTime from "@/features/ui/navigation/Navbar/components/CurrentTime";
import HamburgerMenu from "@/features/ui/navigation/Navbar/components/HamburgerMenu";
import MobileLinkContainer from "@/features/ui/navigation/Navbar/components/MobileLinkContainer";
import SettingsLink from "@/features/ui/navigation/Navbar/components/SettingsLink";
import { useNavbarIsOpen } from "@/features/ui/navigation/Navbar/stores/navbar-store";
import NavLogo from "@/features/ui/navigation/NavLogo";

const Navbar = () => {
  const navbarIsOpen = useNavbarIsOpen();

  return (
    // Navbar
    <nav
      className={`border-b-base-content/50 fixed top-0 right-0 left-0 z-40 flex h-(--navbar-height) flex-col items-start border-b p-0 shadow-md backdrop-blur-sm transition-all duration-1000 ${navbarIsOpen ? "max-md:bg-base-300 max-md:h-screen" : ""}`.trim()}
    >
      {/* Wrapper Container */}
      <div className="flex min-h-19.5 w-full items-center justify-between p-4">
        {/* Left Container */}
        <div className="inner-left-container flex items-center gap-2">
          <HamburgerMenu />

          {/* Logo Container */}
          <div className="flex items-baseline gap-8">
            <NavLogo />
          </div>
        </div>

        {/* Inner Right Container */}
        <div className="flex items-center gap-4 border">
          {/* <LoginLink /> */}
          <CurrentTime />
        </div>
      </div>

      {/* Mobile Navbar Container */}
      <div className="flex size-full justify-center p-4 md:hidden">
        {navbarIsOpen && <MobileLinkContainer />}
      </div>
    </nav>
  );
};

export default Navbar;
