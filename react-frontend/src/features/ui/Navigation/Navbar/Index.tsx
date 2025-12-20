import useNavbarContext from "@features/ui/Navigation/Navbar/hooks/useNavbarContext.tsx";
import HamburgerMenu from "@features/ui/Navigation/Navbar/HamburgerMenu.tsx";
import NavLogo from "@features/ui/Navigation/NavLogo.tsx";
import NavLinkContainer from "@features/ui/Navigation/Navbar/NavLinkContainer.tsx";
import BrainDumpIcon from "@features/ui/Navigation/Navbar/BrainDumpIcon.tsx";
import SettingsIcon from "@features/ui/Navigation/Navbar/SettingsIcon.tsx";
import LoginLink from "@features/ui/Navigation/Navbar/LoginLink.tsx";
import ProfileAvatar from "@features/ui/Navigation/Navbar/ProfileAvatar.tsx";
import { NavbarProvider } from "@features/ui/Navigation/Navbar/stores/NavbarContext.tsx";

const NavbarContent = () => {
    const { isOpen } = useNavbarContext();

    return (
        // Navbar Content
        <nav
            className={`${isOpen ? "bg-base-300 h-screen" : ""} bg-base-100/50 border-b-base-content/50 fixed top-0 right-0 left-0 z-20 h-(--navbar-height) border-b p-4 backdrop-blur-xs transition-all duration-1000`}
        >
            {/* Inner Navbar Container */}
            <div className="flex h-[42px] w-full items-center justify-between">
                {/* Left Container */}
                <div className="flex items-center gap-4">
                    <HamburgerMenu />

                    <div className="flex items-baseline gap-8">
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
