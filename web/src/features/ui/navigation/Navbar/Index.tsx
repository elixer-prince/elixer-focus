import HamburgerMenu from "@/features/ui/navigation/Navbar/HamburgerMenu";
import { useNavbarIsOpen } from "@/features/ui/navigation/Navbar/stores/NavbarStore";
import NavLogo from "@/features/ui/navigation/NavLogo";

const Navbar = () => {
  const navbarIsOpen = useNavbarIsOpen();

  return (
    <nav
      className={`navbar border-b-base-content/50 fixed top-0 right-0 left-0 z-20 h-(--navbar-height) items-start border-b p-4 shadow-md backdrop-blur-sm transition-all duration-1000 ${navbarIsOpen ? "max-md:bg-base-300 max-md:h-screen" : ""}`.trim()}
    >
      <div className="wrapper-container flex h-10 w-full items-center justify-between">
        <div className={"inner-left-container flex items-center gap-2"}>
          <HamburgerMenu />

          <div className={"nav-logo-container flex items-baseline gap-8"}>
            <NavLogo />
          </div>
        </div>

        <div className={"inner-right-container flex items-center gap-4"}>
          {/* <LoginLink /> */}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
