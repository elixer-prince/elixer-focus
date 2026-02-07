import { create } from "zustand";

type NavbarState = {
  navbarIsOpen: boolean;
};

type NavbarActions = {
  toggleNavbar: () => void;
};

const useNavbarStore = create<NavbarState & NavbarActions>((set) => ({
  navbarIsOpen: false,
  toggleNavbar: () => set((state) => ({ navbarIsOpen: !state.navbarIsOpen })),
}));

export const useNavbarIsOpen = () =>
  useNavbarStore((state) => state.navbarIsOpen);

export const useToggleNavbar = () =>
  useNavbarStore((state) => state.toggleNavbar);
