import { Link } from "react-router";

const NavLogo = () => {
    return (
        // Navbar Logo
        <Link to="/" className="select-none">
            <span className="text-xl font-bold">Elixer Focus</span>
        </Link>
    );
};

export default NavLogo;
