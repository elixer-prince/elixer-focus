import HamburgerMenu from "@components/Navbar/HamburgerMenu.tsx";
import {
    NavbarProvider,
    useNavbarContext,
} from "@components/Navbar/stores/NavbarContext.tsx";
import NavLogo from "@features/ui/Navigation/NavLogo.tsx";

const NavbarContent = () => {
    const { isOpen } = useNavbarContext();

    return (
        // Navbar Content
        <nav
            className={`${isOpen ? "max-md:bg-base-300 max-md:h-screen" : ""} border-b-base-content/50 fixed top-0 right-0 left-0 z-20 h-(--navbar-height) border-b-2 p-4 shadow-md backdrop-blur-sm transition-all duration-1000 md:px-8`.trim()}
        >
            {/* Inner Navbar Container */}
            <div className={"flex h-10 w-full items-center justify-between"}>
                {/* Left Container */}
                <div className={"flex items-center gap-4"}>
                    <HamburgerMenu />

                    <div className={"flex items-baseline gap-8"}>
                        <NavLogo />
                    </div>
                </div>

                {/* Right Container */}
                {/*<div className={"flex items-center gap-4"}>*/}
                {/*    <BrainDumpIcon />*/}
                {/*<SettingsIcon />*/}
                {/*    <LoginLink />*/}
                {/*    <ProfileAvatar />*/}
                {/*</div>*/}
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
