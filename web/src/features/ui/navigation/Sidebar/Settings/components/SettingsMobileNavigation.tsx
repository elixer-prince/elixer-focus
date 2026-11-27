import MobileLink from "@/features/ui/navigation/Navbar/components/MobileLink";
import MobileNavigationBackdrop from "@/features/ui/navigation/Navbar/components/MobileNavigationBackdrop";
import {
  useCloseNavbar,
  useNavbarIsOpen,
  useToggleNavbar,
} from "@/features/ui/navigation/Navbar/stores/navbar-store";
import { settingsLinks } from "@/features/ui/navigation/Sidebar/Settings/constants/links";
import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { MdMenu } from "react-icons/md";

const SettingsMobileNavigation = () => {
  const navbarIsOpen = useNavbarIsOpen();
  const toggleNavbar = useToggleNavbar();
  const closeNavbar = useCloseNavbar();
  const navigationRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!navbarIsOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;

      closeNavbar();
      document.getElementById("settings-mobile-navigation-toggle")?.focus();
    };

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (navigationRef.current?.contains(target)) return;
      if (
        target instanceof Element &&
        target.closest('[aria-controls="settings-mobile-navigation"]')
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
      <MobileNavigationBackdrop breakpoint="sm" />
      <button
        id="settings-mobile-navigation-toggle"
        type="button"
        aria-label="Toggle settings navigation menu"
        aria-controls="settings-mobile-navigation"
        aria-expanded={navbarIsOpen}
        onClick={toggleNavbar}
        className="hover:bg-base-content/5 focus-visible:outline-primary cursor-pointer rounded-md p-2 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 active:outline sm:hidden"
      >
        <MdMenu size={24} aria-hidden="true" focusable="false" />
      </button>

      {createPortal(
        <nav
          id="settings-mobile-navigation"
          ref={navigationRef}
          aria-label="Mobile settings navigation"
          aria-hidden={!navbarIsOpen}
          inert={!navbarIsOpen}
          className={`border-base-content/20 bg-base-100 fixed top-(--navbar-height) bottom-0 left-0 z-40 w-[min(18rem,68vw)] overflow-y-auto border-r p-4 shadow-xl transition-transform duration-300 motion-reduce:transition-none sm:hidden ${navbarIsOpen ? "translate-x-0" : "pointer-events-none -translate-x-full"}`.trim()}
        >
          <ul className="space-y-2">
            {settingsLinks.map(({ to, icon, label }) => (
              <li key={to}>
                <MobileLink to={to}>
                  {icon}
                  {label}
                </MobileLink>
              </li>
            ))}
          </ul>
        </nav>,
        document.body,
      )}
    </>
  );
};

export default SettingsMobileNavigation;
