import { Link } from "react-router";
import type { ReactNode } from "react";

interface NavLinkProps {
    to: string;
    children: ReactNode;
}

const NavLink = ({ to, children }: NavLinkProps) => {
    return (
        // Navbar Link
        <Link
            className="text-base-content/75 hover:text-base-content transition-colors"
            to={to}
        >
            {children}
        </Link>
    );
};

export default NavLink;
