import {
  createContext,
  type Dispatch,
  type PropsWithChildren,
  type SetStateAction,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

type NavbarContextType = {
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
};

const NavbarContext = createContext<NavbarContextType | null>(null);

export const NavbarProvider = ({ children }: PropsWithChildren) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => document.body.classList.add("overflow-hidden"), 750);
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
    throw new Error("useNavbarContext must be used inside a NavbarProvider!");
  }

  return navbarContext;
};
