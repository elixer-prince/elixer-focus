import { Link } from "react-router";
import type { ReactNode } from "react";

interface SidebarLinkProps {
    to: string;
    children: ReactNode;
}

const SidebarLink = ({ to, children }: SidebarLinkProps) => {
    return (
        <Link to={to} className="btn btn-primary btn-soft">
            {children}
        </Link>
    );
};

export default SidebarLink;
