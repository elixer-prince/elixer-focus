import NavLinkContainer from "@features/ui/Navigation/Navbar/NavLinkContainer.tsx";
import ProfileAvatar from "@features/ui/Navigation/Navbar/ProfileAvatar.tsx";
import NavLogo from "@features/ui/Navigation/NavLogo.tsx";
import { Link } from "react-router";

const Navbar = () => {
    return (
        // Main Navbar
        <nav className="fixed top-0 right-0 left-0 z-20 flex h-(--navbar-height) items-center justify-between p-4 pl-8 backdrop-blur-xs transition-colors duration-1000">
            {/* Left Container */}
            <div className="flex items-baseline gap-8">
                <NavLogo />
                <NavLinkContainer />
            </div>

            {/* Right Container */}
            <div className="flex items-center gap-4">
                <Link
                    className="btn btn-soft btn-primary"
                    to="/settings/themes"
                >
                    Settings
                </Link>
                <ProfileAvatar />
            </div>
        </nav>
    );
};

export default Navbar;
