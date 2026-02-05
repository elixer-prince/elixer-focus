import { Link, useLocation } from "react-router";
import type { PropsWithChildren } from "react";

interface NavLinkProps {
    to: string;
}

const NavbarLink = ({ to, children }: PropsWithChildren<NavLinkProps>) => {
    const location = useLocation();

    return (
        // Navbar Link
        <Link
            className={`text-base-content/75 transition-colors ${location.pathname === to ? "text-primary font-bold" : "hover:text-base-content"}`}
            to={to}
        >
            {children}
        </Link>
    );
};

export default NavbarLink;
