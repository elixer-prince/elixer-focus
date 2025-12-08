import { ThemeContext } from "@stores/ThemeContext.tsx";
import { useContext } from "react";

const useThemeContext = () => {
    const themeContext = useContext(ThemeContext);

    if (!themeContext) {
        throw new Error("useThemeContext must be used within a ThemeProvider!");
    }

    return themeContext;
};

export default useThemeContext;
