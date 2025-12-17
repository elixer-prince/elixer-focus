import { Link } from "react-router";
import type { ReactNode } from "react";

interface NavLinkProps {
    to: string;
    children: ReactNode;
}

const NavLink = ({ to, children }: NavLinkProps) => {
    return (
        // Navbar Link
        <Link className="text-primary hover:underline" to={to}>
            {children}
        </Link>
    );
};

export default NavLink;
