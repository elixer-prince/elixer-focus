import { useToggleNavbar } from "@/features/ui/navigation/Navbar/stores/navbar-store";
import { MdMenu } from "react-icons/md";

const HamburgerMenu = () => {
  const toggleNavbar = useToggleNavbar();

  return (
    <button
      aria-label="Toggle navigation menu"
      onClick={toggleNavbar}
      className="hamburger-menu hover:bg-base-content/5 outline-primary cursor-pointer rounded-md p-2 transition-colors active:outline md:hidden"
    >
      <MdMenu size={24} />
    </button>
  );
};

export default HamburgerMenu;
