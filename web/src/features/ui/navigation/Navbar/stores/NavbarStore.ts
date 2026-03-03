import { create } from "zustand";
import { persist } from "zustand/middleware";

type NavbarState = {
  navbarIsOpen: boolean;
};

type NavbarActions = {
  toggleNavbar: () => void;
  openNavbar: () => void;
  closeNavbar: () => void;
};

const useNavbarStore = create<NavbarState & NavbarActions>()(
  persist(
    (set) => ({
      navbarIsOpen: false,

      toggleNavbar: () =>
        set((state) => ({ navbarIsOpen: !state.navbarIsOpen })),

      openNavbar: () => set({ navbarIsOpen: true }),

      closeNavbar: () => set({ navbarIsOpen: false }),
    }),
    {
      name: "navbar-storage",
    },
  ),
);

// State

export const useNavbarIsOpen = () =>
  useNavbarStore((state) => state.navbarIsOpen);

// Actions

export const useToggleNavbar = () =>
  useNavbarStore((state) => state.toggleNavbar);

export const useOpenNavbar = () => useNavbarStore((state) => state.openNavbar);

export const useCloseNavbar = () =>
  useNavbarStore((state) => state.closeNavbar);
