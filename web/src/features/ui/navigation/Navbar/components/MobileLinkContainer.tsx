import MobileLink from "@/features/ui/navigation/Navbar/components/MobileLink";
import MobileNavigationBackdrop from "@/features/ui/navigation/Navbar/components/MobileNavigationBackdrop";
import { defaultLinks } from "@/features/ui/navigation/Sidebar/Default/constants/links";
import {
  useCloseNavbar,
  useNavbarIsOpen,
} from "@/features/ui/navigation/Navbar/stores/navbar-store";
import { useEffect, useRef } from "react";

const MobileLinkContainer = () => {
  const navbarIsOpen = useNavbarIsOpen();
  const closeNavbar = useCloseNavbar();
  const navigationRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!navbarIsOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;

      closeNavbar();
      document.getElementById("mobile-navigation-toggle")?.focus();
    };

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (navigationRef.current?.contains(target)) return;
      if (
        target instanceof Element &&
        target.closest('[aria-controls="mobile-navigation"]')
      ) {
        return;
      }

      closeNavbar();
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("pointerdown", handlePointerDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [closeNavbar, navbarIsOpen]);

  return (
    <>
      <MobileNavigationBackdrop breakpoint="md" />
      <nav
        id="mobile-navigation"
        ref={navigationRef}
        aria-label="Mobile navigation"
        aria-hidden={!navbarIsOpen}
        inert={!navbarIsOpen}
        className={`border-base-content/20 bg-base-100 fixed top-(--navbar-height) bottom-0 left-0 z-40 w-[min(18rem,68vw)] overflow-y-auto border-r p-4 shadow-xl transition-transform duration-300 motion-reduce:transition-none md:hidden ${navbarIsOpen ? "translate-x-0" : "pointer-events-none -translate-x-full"}`.trim()}
      >
        <ul className="space-y-2">
          {defaultLinks.map(({ to, icon: Icon, label }) => (
            <li key={to}>
              <MobileLink to={to}>
                <Icon size={24} aria-hidden="true" focusable="false" />
                {label}
              </MobileLink>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
};

export default MobileLinkContainer;
