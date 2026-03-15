import CurrentTime from "@/features/ui/navigation/Navbar/components/CurrentTime";
import HamburgerMenu from "@/features/ui/navigation/Navbar/components/HamburgerMenu";
import MobileLinkContainer from "@/features/ui/navigation/Navbar/components/MobileLinkContainer";
import { useNavbarIsOpen } from "@/features/ui/navigation/Navbar/stores/navbar-store";
import NavLogo from "@/features/ui/navigation/NavLogo";

const Navbar = () => {
  const navbarIsOpen = useNavbarIsOpen();

  return (
    <nav
      className={`navbar border-b-base-content/50 fixed top-0 right-0 left-0 z-40 flex h-(--navbar-height) flex-col items-start border-b p-0 shadow-md backdrop-blur-sm transition-all duration-1000 ${navbarIsOpen ? "max-md:bg-base-300 max-md:h-screen" : ""}`.trim()}
    >
      <div className="wrapper-container flex min-h-19.5 w-full items-center justify-between p-4">
        <div className="inner-left-container flex items-center gap-2">
          <HamburgerMenu />

          <div className="nav-logo-container flex items-baseline gap-8">
            <NavLogo />
          </div>
        </div>

        <div className="inner-right-container flex items-center gap-4">
          {/* <LoginLink /> */}
          <CurrentTime />
        </div>
      </div>

      <div className="flex size-full justify-center p-4 md:hidden">
        {navbarIsOpen && <MobileLinkContainer />}
      </div>
    </nav>
  );
};

export default Navbar;
