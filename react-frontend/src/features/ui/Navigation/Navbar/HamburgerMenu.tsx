import { FiMenu } from "react-icons/fi";
import useNavbarContext from "@features/ui/Navigation/Navbar/hooks/useNavbarContext.tsx";

const HamburgerMenu = () => {
    const { isOpen, setIsOpen } = useNavbarContext();

    // Hamburger Menu
    return (
        <FiMenu
            size={24}
            className="cursor-pointer"
            onClick={() => setIsOpen(!isOpen)}
        />
    );
};

export default HamburgerMenu;
