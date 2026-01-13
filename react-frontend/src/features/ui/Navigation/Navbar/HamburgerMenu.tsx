import { FiMenu } from "react-icons/fi";
import useNavbarContext from "@features/ui/Navigation/Navbar/hooks/useNavbarContext.tsx";

const HamburgerMenu = () => {
    const { isOpen, setIsOpen } = useNavbarContext();

    // Hamburger Menu

    return (
        <div className="hover:bg-base-content/5 outline-primary cursor-pointer rounded-md p-2 transition-colors active:outline md:hidden">
            <FiMenu size={24} onClick={() => setIsOpen(!isOpen)} />
        </div>
    );
};

export default HamburgerMenu;
