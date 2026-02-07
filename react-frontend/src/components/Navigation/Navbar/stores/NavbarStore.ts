import { create } from "zustand";

type NavbarStore = {
  navbarIsOpen: boolean;
  toggleNavbar: () => void;
};

export const useNavbarStore = create<NavbarStore>((set) => ({
  navbarIsOpen: false,
  toggleNavbar: () => set((state) => ({ navbarIsOpen: !state.navbarIsOpen })),
}));
