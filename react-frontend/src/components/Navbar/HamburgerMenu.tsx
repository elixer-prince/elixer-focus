import { useNavbarContext } from "@components/Navbar/stores/NavbarContext.tsx";
import { FiMenu } from "react-icons/fi";

const HamburgerMenu = () => {
    const { isOpen, setIsOpen } = useNavbarContext();

    return (
        <div
            className={
                "hover:bg-base-content/5 outline-primary cursor-pointer rounded-md p-2 transition-colors active:outline md:hidden"
            }
        >
            <FiMenu size={24} onClick={() => setIsOpen(!isOpen)} />
        </div>
    );
};

export default HamburgerMenu;
