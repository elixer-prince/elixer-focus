import { createContext, type Dispatch, type ReactNode, type SetStateAction, useMemo, useState } from "react";

interface NavbarContextProps {
    children: ReactNode;
}

type NavbarContextType = {
    isOpen: boolean;
    setIsOpen: Dispatch<SetStateAction<boolean>>;
};

const NavbarContext = createContext<NavbarContextType | null>(null);
const NavbarProvider = ({ children }: NavbarContextProps) => {
    const [isOpen, setIsOpen] = useState<boolean>(false);

    const contextValues: NavbarContextType = useMemo(
        () => ({ isOpen, setIsOpen }),
        [isOpen],
    );

    return (
        <NavbarContext.Provider value={contextValues}>
            {children}
        </NavbarContext.Provider>
    );
};

export { NavbarProvider, NavbarContext };
