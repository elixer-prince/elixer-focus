import NavLinkContainer from "@features/ui/Navbar/NavLinkContainer.tsx";
import NavbarLogo from "@features/ui/Navbar/NavbarLogo.tsx";
import { Link } from "react-router";

const Navbar = () => {
    return (
        <nav className="bg-base-100 fixed top-0 bottom-0 left-0 z-20 flex w-57 flex-col p-4 transition-colors duration-1000">
            <div className="flex justify-center">
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
