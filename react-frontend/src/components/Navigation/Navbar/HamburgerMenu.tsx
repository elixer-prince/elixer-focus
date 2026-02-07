import { useNavbarContext } from "@/components/Navigation/Navbar/stores/NavbarContext";
import { MdMenu } from "react-icons/md";

const HamburgerMenu = () => {
  const { isOpen, setIsOpen } = useNavbarContext();

  return (
    <div
      className={
        "hover:bg-base-content/5 outline-primary cursor-pointer rounded-md p-2 transition-colors active:outline md:hidden"
      }
    >
      <MdMenu size={24} onClick={() => setIsOpen(!isOpen)} />
    </div>
  );
};

export default HamburgerMenu;
