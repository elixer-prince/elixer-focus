import { useNavbarStore } from "@/features/ui/navigation/Navbar/stores/navbar-store";
import { act } from "@testing-library/react";

describe("Navbar Store", () => {
  describe("toggleNavbar", () => {
    it("should set the navbar open state to false if it is true", () => {
      const toggleNavbar = useNavbarStore.getState().toggleNavbar;
      useNavbarStore.setState({ navbarIsOpen: true });

      act(() => {
        toggleNavbar();
      });

      const navbarIsOpen = useNavbarStore.getState().navbarIsOpen;
      expect(navbarIsOpen).toBe(false);
    });

    it("should set the navbar open state to true if it is false", () => {
      const toggleNavbar = useNavbarStore.getState().toggleNavbar;
      useNavbarStore.setState({ navbarIsOpen: false });

      act(() => {
        toggleNavbar();
      });

      const navbarIsOpen = useNavbarStore.getState().navbarIsOpen;
      expect(navbarIsOpen).toBe(true);
    });
  });

  describe("openNavbar", () => {
    it("should set the navbar open state to true", () => {
      const openNavbar = useNavbarStore.getState().openNavbar;

      act(() => {
        openNavbar();
      });

      const navbarIsOpen = useNavbarStore.getState().navbarIsOpen;
      expect(navbarIsOpen).toBe(true);
    });
  });

  describe("closeNavbar", () => {
    it("should set the navbar open state to false", () => {
      const closeNavbar = useNavbarStore.getState().closeNavbar;

      act(() => {
        closeNavbar();
      });

      const navbarIsOpen = useNavbarStore.getState().navbarIsOpen;
      expect(navbarIsOpen).toBe(false);
    });
  });
});
