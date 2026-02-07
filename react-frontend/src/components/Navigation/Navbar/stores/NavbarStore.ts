import { create } from "zustand";

type NavbarStore = {
  navbarIsOpen: boolean;
  toggleNavbar: () => void;
};

const useNavbarStore = create<NavbarStore>((set) => ({
  navbarIsOpen: false,
  toggleNavbar: () => set((state) => ({ navbarIsOpen: !state.navbarIsOpen })),
}));

export const useNavbarIsOpen = () =>
  useNavbarStore((state) => state.navbarIsOpen);

export const useToggleNavbar = () =>
  useNavbarStore((state) => state.toggleNavbar);
