import {
  useCloseNavbar,
  useNavbarIsOpen,
} from "@/features/ui/navigation/Navbar/stores/navbar-store";
import { useEffect } from "react";
import { createPortal } from "react-dom";

type MobileNavigationBackdropProps = {
  breakpoint: "sm" | "md";
};

const desktopWidths = {
  sm: 640,
  md: 768,
} as const;

const visibilityClasses = {
  sm: "sm:hidden",
  md: "md:hidden",
} as const;

const MobileNavigationBackdrop = ({
  breakpoint,
}: MobileNavigationBackdropProps) => {
  const navbarIsOpen = useNavbarIsOpen();
  const closeNavbar = useCloseNavbar();

  useEffect(() => {
    if (!navbarIsOpen) return;

    const bodyOverflow = document.body.style.overflow;
    const rootOverflow = document.documentElement.style.overflow;
    const desktopQuery = window.matchMedia?.(
      `(min-width: ${desktopWidths[breakpoint]}px)`,
    );

    const updateScrollLock = () => {
      document.body.style.overflow = desktopQuery?.matches
        ? bodyOverflow
        : "hidden";
      document.documentElement.style.overflow = desktopQuery?.matches
        ? rootOverflow
        : "hidden";
    };

    updateScrollLock();
    desktopQuery?.addEventListener("change", updateScrollLock);

    return () => {
      desktopQuery?.removeEventListener("change", updateScrollLock);
      document.body.style.overflow = bodyOverflow;
      document.documentElement.style.overflow = rootOverflow;
    };
  }, [breakpoint, navbarIsOpen]);

  return createPortal(
    <button
      type="button"
      aria-label="Close mobile navigation"
      aria-hidden={!navbarIsOpen}
      inert={!navbarIsOpen}
      tabIndex={navbarIsOpen ? 0 : -1}
      onClick={closeNavbar}
      className={`fixed top-(--navbar-height) right-0 bottom-0 left-0 z-[35] bg-black/30 transition-opacity duration-300 motion-reduce:transition-none ${visibilityClasses[breakpoint]} ${navbarIsOpen ? "opacity-100" : "pointer-events-none opacity-0"}`.trim()}
    />,
    document.body,
  );
};

export default MobileNavigationBackdrop;
