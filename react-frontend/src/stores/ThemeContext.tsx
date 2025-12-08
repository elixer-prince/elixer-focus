import {
    createContext,
    useEffect,
    useMemo,
    useState,
    type Dispatch,
    type ReactNode,
    type SetStateAction,
} from "react";

interface ThemeContextProps {
    children: ReactNode;
}

type ThemeContextType = {
    currentTheme: string;
    setCurrentTheme: Dispatch<SetStateAction<string>>;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const ThemeProvider = ({ children }: ThemeContextProps) => {
    const [currentTheme, setCurrentTheme] = useState(() => {
        return localStorage.getItem("currentTheme") || "dark";
    });

    useEffect(() => {
        if (currentTheme) {
            document.documentElement.setAttribute("data-theme", currentTheme);
            localStorage.setItem("currentTheme", currentTheme);
        }
    }, [currentTheme]);

    const contextValue: ThemeContextType = useMemo(
        () => ({
            currentTheme,
            setCurrentTheme,
        }),
        [currentTheme, setCurrentTheme],
    );

    return (
        <ThemeContext.Provider value={contextValue}>
            {children}
        </ThemeContext.Provider>
    );
};

export { ThemeProvider, ThemeContext };
