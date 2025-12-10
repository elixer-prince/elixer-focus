import { Link } from "react-router";

const NavbarLogo = () => {
    return (
        <Link to="/" className=" text-center">
            <span className="text-xl font-bold">Elixer Focus</span>
        </Link>
    );
};

export default NavbarLogo;
