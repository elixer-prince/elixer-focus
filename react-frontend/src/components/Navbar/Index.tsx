import HamburgerMenu from "@components/Navbar/HamburgerMenu.tsx";
import useNavbarContext from "@components/Navbar/hooks/useNavbarContext.tsx";
import { NavbarProvider } from "@components/Navbar/stores/NavbarContext.tsx";
import NavLogo from "@features/ui/Navigation/NavLogo.tsx";
import { navbarOpenStyles, navbarStyles } from "@components/Navbar/styles.ts";

const NavbarContent = () => {
    const { isOpen } = useNavbarContext();

    return (
        // Navbar Content
        <nav
            className={`${isOpen ? navbarOpenStyles : ""} ${navbarStyles}`.trim()}
        >
            {/* Inner Navbar Container */}
            <div className={"flex h-10 w-full items-center justify-between"}>
                {/* Left Container */}
                <div className={"flex items-center gap-4"}>
                    <HamburgerMenu />

                    <div className={"flex items-baseline gap-8"}>
                        <NavLogo />
                        {/*<NavLinkContainer />*/}
                    </div>
                </div>

                {/* Right Container */}
                {/*<div className={"flex items-center gap-4"}>*/}
                {/*    <BrainDumpIcon />*/}
                {/*    <SettingsIcon />*/}
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
