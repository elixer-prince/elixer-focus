import CurrentTime from "@/features/ui/navigation/Navbar/components/CurrentTime";
import HamburgerMenu from "@/features/ui/navigation/Navbar/components/HamburgerMenu";
import MobileLinkContainer from "@/features/ui/navigation/Navbar/components/MobileLinkContainer";
import SettingsLink from "@/features/ui/navigation/Navbar/components/SettingsLink";
import NavLogo from "@/features/ui/navigation/NavLogo";

const Navbar = () => {
  return (
    <>
      {/* Navbar */}
      <nav className="border-b-base-content/50 fixed top-0 right-0 left-0 z-40 flex h-(--navbar-height) items-start border-b p-0 shadow-md backdrop-blur-sm transition-colors duration-500">
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
          <div className="flex items-center gap-4">
            {/* <LoginLink /> */}
            <CurrentTime />
            <SettingsLink />
          </div>
        </div>
      </nav>
      <MobileLinkContainer />
    </>
  );
};

export default Navbar;
