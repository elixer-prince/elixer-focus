import ProfileAvatar from "@features/ui/Navigation/Navbar/ProfileAvatar.tsx";
import NavLogo from "@features/ui/Navigation/NavLogo.tsx";
import NavLinkContainer from "@features/ui/Navigation/Navbar/NavLinkContainer.tsx";
import HamburgerMenu from "@features/ui/Navigation/Navbar/HamburgerMenu.tsx";
import BrainDumpIcon from "@features/ui/Navigation/Navbar/BrainDumpIcon.tsx";
import SettingsIcon from "@features/ui/Navigation/Navbar/SettingsIcon.tsx";
import LoginLink from "@features/ui/Navigation/Navbar/LoginLink.tsx";
import { NavbarProvider } from "@features/ui/Navigation/Navbar/stores/NavbarContext.tsx";
import useNavbarContext from "@features/ui/Navigation/Navbar/hooks/useNavbarContext.tsx";

const NavbarContent = () => {
    const { isOpen } = useNavbarContext();

    return (
        // Navbar Content
        <nav
            className={`${isOpen ? "" : ""} bg-base-100/50 border-b-base-content/25 fixed top-0 right-0 left-0 z-20 flex h-(--navbar-height) items-center justify-between border-b p-4 backdrop-blur-xs transition-colors duration-1000`.trim()}
        >
            {/* Left Container */}
            <div className="flex items-center gap-4">
                <HamburgerMenu />

                <div className="flex items-center gap-8">
                    <NavLogo />
                    <NavLinkContainer />
                </div>
            </div>

            {/* Right Container */}
            <div className="flex items-center gap-4">
                <BrainDumpIcon />
                <SettingsIcon />
                <LoginLink />
                <ProfileAvatar />
            </div>
        </nav>
    );
};

const Navbar = () => {
    return (
        // Navbar Wrapper
        <NavbarProvider>
            <NavbarContent />
        </NavbarProvider>
    );
};

export default Navbar;
