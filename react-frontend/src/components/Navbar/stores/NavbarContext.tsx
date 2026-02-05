import {
    createContext,
    type Dispatch,
    type ReactNode,
    type SetStateAction,
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react";

interface NavbarContextProps {
    children: ReactNode;
}

type NavbarContextType = {
    isOpen: boolean;
    setIsOpen: Dispatch<SetStateAction<boolean>>;
};

const NavbarContext = createContext<NavbarContextType | null>(null);

export const NavbarProvider = ({ children }: NavbarContextProps) => {
    const [isOpen, setIsOpen] = useState<boolean>(false);

    useEffect(() => {
        if (isOpen) {
            setTimeout(
                () => document.body.classList.add("overflow-hidden"),
                750,
            );
        } else {
            document.body.classList.remove("overflow-hidden");
        }
    }, [isOpen]);

    const contextValues: NavbarContextType = useMemo(
        () => ({ isOpen, setIsOpen }),
        [isOpen, setIsOpen],
    );

    return (
        <NavbarContext.Provider value={contextValues}>
            {children}
        </NavbarContext.Provider>
    );
};

export const useNavbarContext = () => {
    const navbarContext = useContext(NavbarContext);

    if (!navbarContext) {
        throw new Error("useNavbarContext must be used with a NavbarProvider!");
    }

    return navbarContext;
};
