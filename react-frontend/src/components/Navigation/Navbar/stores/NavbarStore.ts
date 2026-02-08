import { create } from "zustand";
import { persist } from "zustand/middleware";

type NavbarState = {
  navbarIsOpen: boolean;
};

type NavbarActions = {
  toggleNavbar: () => void;
};

const useNavbarStore = create<NavbarState & NavbarActions>()(
  persist(
    (set) => ({
      navbarIsOpen: false,
      toggleNavbar: () =>
        set((state) => ({ navbarIsOpen: !state.navbarIsOpen })),
    }),
    {
      name: "navbar-storage",
    },
  ),
);

export const useNavbarIsOpen = () =>
  useNavbarStore((state) => state.navbarIsOpen);

export const useToggleNavbar = () =>
  useNavbarStore((state) => state.toggleNavbar);
