import { FiMenu } from "react-icons/fi";
import useNavbarContext from "@hooks/useNavbarContext.tsx";

const HamburgerMenu = () => {
    const { isOpen, setIsOpen } = useNavbarContext();

    // Hamburger Menu

    return (
        <div className="hover:bg-base-content/5 cursor-pointer rounded-md p-2 transition-colors md:hidden">
            <FiMenu size={24} onClick={() => setIsOpen(!isOpen)} />
        </div>
    );
};

export default HamburgerMenu;
