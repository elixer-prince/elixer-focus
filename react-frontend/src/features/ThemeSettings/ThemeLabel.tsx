import useThemeContext from "@hooks/useThemeContext.tsx";
import type { ReactNode } from "react";

interface ThemeLabelProps {
    value: string;
    children: ReactNode;
}

const ThemeLabel = ({ value, children }: ThemeLabelProps) => {
    const { currentTheme, setCurrentTheme } = useThemeContext();

    const handleChange = () => {
        setCurrentTheme(value);
    };

    return (
        <label className="flex cursor-pointer items-center gap-2 rounded-md p-2">
            <input
                type="radio"
                name="theme-radios"
                className="radio accent-primary radio-sm theme-controller"
                value={value}
                checked={currentTheme === value}
                onChange={handleChange}
            />
            {children}
        </label>
    );
};

export default ThemeLabel;
