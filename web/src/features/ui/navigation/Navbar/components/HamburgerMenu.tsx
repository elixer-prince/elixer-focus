import {
  useNavbarIsOpen,
  useToggleNavbar,
} from "@/features/ui/navigation/Navbar/stores/navbar-store";
import { MdMenu } from "react-icons/md";

const HamburgerMenu = () => {
  const navbarIsOpen = useNavbarIsOpen();
  const toggleNavbar = useToggleNavbar();

  return (
    <button
      id="mobile-navigation-toggle"
      aria-label="Toggle navigation menu"
      aria-controls="mobile-navigation"
      aria-expanded={navbarIsOpen}
      onClick={toggleNavbar}
      className="hamburger-menu hover:bg-base-content/5 focus-visible:outline-primary cursor-pointer rounded-md p-2 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 active:outline md:hidden"
    >
      <MdMenu size={24} />
    </button>
  );
};

export default HamburgerMenu;
