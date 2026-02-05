import { NavLink } from "react-router";
import type { PropsWithChildren } from "react";

interface LinkProps {
    to: string;
}

const SidebarLink = ({ to, children }: PropsWithChildren<LinkProps>) => {
    return (
        <NavLink
            className={
                "hover:bg-base-content/25 block rounded-md border p-2 transition-colors"
            }
            to={to}
        >
            {children}
        </NavLink>
    );
};

export default SidebarLink;
