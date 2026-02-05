import { NavLink } from "react-router";
import type { PropsWithChildren } from "react";

interface LinkProps {
    to: string;
}

const SidebarLink = ({ to, children }: PropsWithChildren<LinkProps>) => {
    return (
        <NavLink
            className={({ isActive }) => {
                const classes =
                    "hover:bg-primary-content/10 flex items-center gap-1 rounded-md border-2 p-2 font-bold transition-colors";

                return `${classes} ${isActive ? "text-primary pointer-events-none" : "border-primary-content/50 hover:border-primary-content/75"}`.trim();
            }}
            to={to}
        >
            {children}
        </NavLink>
    );
};

export default SidebarLink;
