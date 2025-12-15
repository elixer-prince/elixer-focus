import { Link } from "react-router";
import NavLinkContainer from "@features/ui/Navigation/Navbar/NavLinkContainer.tsx";
import NavLogo from "@features/ui/Navigation/NavLogo.tsx";

const Navbar = () => {
    return (
        <nav className="fixed top-0 right-0 left-0 z-20 flex h-(--navbar-height) items-center justify-between p-4 pl-8 transition-colors duration-1000">
            <div className="flex items-baseline gap-8">
                <NavLogo />
                <NavLinkContainer />
            </div>

            <Link className="btn btn-soft btn-primary" to="/settings/themes">
                Settings
            </Link>
        </nav>
    );
};

export default Navbar;
