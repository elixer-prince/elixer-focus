import type { PropsWithChildren } from "react";
import { NavLink } from "react-router";

interface LinkProps {
  to: string;
}

const SidebarLink = ({ to, children }: PropsWithChildren<LinkProps>) => {
  return (
    <NavLink
      className={({ isActive }) => {
        const classes =
          "flex items-center gap-1 rounded-md p-2 transition-colors duration-500";

        return `${classes} ${
          isActive
            ? "text-primary bg-primary-content/10 pointer-events-none font-bold"
            : "border-primary-content/50 hover:bg-primary-content/4 hover:border-primary-content/75"
        }`.trim();
      }}
      to={to}
    >
      {children}
    </NavLink>
  );
};

export default SidebarLink;
