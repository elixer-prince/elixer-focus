import { useToggleNavbar } from "@/components/Navigation/Navbar/stores/NavbarStore";
import { MdMenu } from "react-icons/md";

const HamburgerMenu = () => {
  const toggleNavbar = useToggleNavbar();

  return (
    <button
      className={
        "hover:bg-base-content/5 outline-primary cursor-pointer rounded-md p-2 transition-colors active:outline md:hidden"
      }
    >
      <MdMenu size={24} onClick={toggleNavbar} />
    </button>
  );
};

export default HamburgerMenu;
