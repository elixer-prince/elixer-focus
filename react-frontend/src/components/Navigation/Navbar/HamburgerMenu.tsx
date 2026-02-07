import { MdMenu } from "react-icons/md";
import { useToggleNavbar } from "./stores/NavbarStore";

const HamburgerMenu = () => {
  const toggleNavbar = useToggleNavbar();

  return (
    <div
      className={
        "hover:bg-base-content/5 outline-primary cursor-pointer rounded-md p-2 transition-colors active:outline md:hidden"
      }
    >
      <MdMenu size={24} onClick={toggleNavbar} />
    </div>
  );
};

export default HamburgerMenu;
