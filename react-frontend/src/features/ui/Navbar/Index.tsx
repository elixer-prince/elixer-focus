import {Link} from "react-router";
import NavLinkContainer from "@features/ui/Navbar/NavLinkContainer.tsx";
import NavbarLogo from "@features/ui/Navbar/NavbarLogo.tsx";

const Navbar = () => {
    return (
        <nav className="bg-base-300 sticky top-0 right-0 left-0 z-20 flex items-center justify-between p-4 pl-8 transition-colors duration-1000">
            <div className="flex items-baseline gap-8">
                <NavbarLogo />
                <NavLinkContainer />
            </div>

            <Link className={"btn btn-soft btn-primary"} to={"/settings"}>
                Settings
            </Link>
        </nav>
    );
};

export default Navbar;
