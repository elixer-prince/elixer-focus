import {
    createContext,
    type PropsWithChildren,
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react";

type ThemeContextType = {
    currentTheme: string;
    setCurrentTheme: (theme: string) => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: PropsWithChildren) => {
    const [currentTheme, setCurrentTheme] = useState(
        localStorage.getItem("currentTheme") || "dark",
    );

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

export const useThemeContext = () => {
    const themeContext = useContext(ThemeContext);

    if (!themeContext) {
        throw new Error("useThemeContext must be used within a ThemeProvider!");
    }

    return themeContext;
};
