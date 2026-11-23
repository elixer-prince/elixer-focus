import { create } from "zustand";

type NavbarState = {
  navbarIsOpen: boolean;
};

type NavbarActions = {
  toggleNavbar: () => void;
  openNavbar: () => void;
  closeNavbar: () => void;
};

export const useNavbarStore = create<NavbarState & NavbarActions>()((set) => ({
  navbarIsOpen: false,

  toggleNavbar: () => set((state) => ({ navbarIsOpen: !state.navbarIsOpen })),

  openNavbar: () => set({ navbarIsOpen: true }),

  closeNavbar: () => set({ navbarIsOpen: false }),
}));

// State

export const useNavbarIsOpen = () =>
  useNavbarStore((state) => state.navbarIsOpen);

// Actions

export const useToggleNavbar = () =>
  useNavbarStore((state) => state.toggleNavbar);

export const useOpenNavbar = () => useNavbarStore((state) => state.openNavbar);

export const useCloseNavbar = () =>
  useNavbarStore((state) => state.closeNavbar);
