import { useCloseNavbar } from "@/features/ui/navigation/Navbar/stores/navbar-store";
import type { PropsWithChildren } from "react";
import { NavLink } from "react-router";

const MobileLink = ({ to, children }: PropsWithChildren<{ to: string }>) => {
  const closeNavbar = useCloseNavbar();

  return (
    <NavLink
      className={({ isActive }) => {
        return `rounded-box text-base-content focus-visible:outline-primary flex min-h-12 items-center gap-3 border px-4 py-3 transition-colors duration-500 focus-visible:outline-2 focus-visible:outline-offset-2 ${
          isActive
            ? "border-primary/20 bg-primary/10 text-primary font-semibold"
            : "hover:bg-base-200 border-transparent"
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
