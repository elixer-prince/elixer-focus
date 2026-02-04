import { useContext } from "react";
import { NavbarContext } from "@components/Navbar/stores/NavbarContext.tsx";

const useNavbarContext = () => {
    const navbarContext = useContext(NavbarContext);

    if (!navbarContext) {
        throw new Error("useNavbarContext must be used with a NavbarProvider!");
    }

    return navbarContext;
};

export default useNavbarContext;
