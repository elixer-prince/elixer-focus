import { NavLink } from "react-router";
import type { PropsWithChildren } from "react";
import { navLinkStyles } from "@components/Sidebar/styles.ts";

interface LinkProps {
    to: string;
}

const Link = ({ to, children }: PropsWithChildren<LinkProps>) => {
    return (
        <NavLink className={navLinkStyles} to={to}>
            {children}
        </NavLink>
    );
};

export default Link;
