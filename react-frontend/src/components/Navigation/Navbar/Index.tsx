import HamburgerMenu from "@/components/Navigation/Navbar/HamburgerMenu";
import { useNavbarStore } from "@/components/Navigation/Navbar/stores/NavbarStore";
import NavLogo from "@/components/Navigation/NavLogo";

const Navbar = () => {
  const navbarIsOpen = useNavbarStore((state) => state.navbarIsOpen);

  return (
    <nav
      className={`border-b-base-content/50 fixed top-0 right-0 left-0 z-20 h-(--navbar-height) border-b p-4 shadow-md backdrop-blur-sm transition-all duration-1000 ${navbarIsOpen ? "max-md:bg-base-300 max-md:h-screen" : ""}`.trim()}
    >
      {/* Wrapper Container */}
      <div className={"flex h-10 w-full items-center justify-between"}>
        {/* Inner Left Container */}
        <div className={"flex items-center gap-2"}>
          <HamburgerMenu />

          <div className={"flex items-baseline gap-8"}>
            <NavLogo />
          </div>
        </div>

        {/* Inner Right Container */}
        <div className={"flex items-center gap-4"}>{/* <LoginLink /> */}</div>
      </div>
    </nav>
  );
};

export default Navbar;
