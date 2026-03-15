import { useCloseNavbar } from "@/features/ui/navigation/Navbar/stores/navbar-store";
import type { PropsWithChildren } from "react";
import { NavLink } from "react-router";

const MobileLink = ({ to, children }: PropsWithChildren<{ to: string }>) => {
  const closeNavbar = useCloseNavbar();

  return (
    <NavLink
      className={({ isActive }) => {
        return `flex items-center gap-1 rounded-md px-4 py-2 transition-colors duration-500 ${
          isActive
            ? "text-primary bg-primary-content/10 pointer-events-none font-bold"
            : "border-primary-content/50 hover:bg-primary-content/4 hover:border-primary-content/75"
        }`.trim();
      }}
      to={to}
      onClick={closeNavbar}
    >
      {children}
    </NavLink>
  );
};

export default MobileLink;
