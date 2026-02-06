import type { PropsWithChildren } from "react";
import { Link } from "react-router";

interface SidebarLinkProps {
    to: string;
}

const SidebarLink = ({ to, children }: PropsWithChildren<SidebarLinkProps>) => {
    return (
        <Link to={to} className="menu menu-primary">
            {children}
        </Link>
    );
};

export default SidebarLink;
