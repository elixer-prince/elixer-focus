import useThemeContext from "@hooks/useThemeContext.tsx";
import type { ReactNode } from "react";
import ThemePreview from "@features/Settings/ThemeSettings/ThemePreview.tsx";

interface ThemeLabelProps {
    value: string;
    children: ReactNode;
}

const ThemeLabel = ({ value, children }: ThemeLabelProps) => {
    const { currentTheme, setCurrentTheme } = useThemeContext();
    const selected = currentTheme === value;

    return (
        <label className="cursor-pointer">
            {/* Hide the radio, keep accessibility */}
            <input
                type="radio"
                name="theme-radios"
                className="sr-only"
                value={value}
                checked={selected}
                onChange={() => setCurrentTheme(value)}
            />

            {/* The visible clickable square */}
            <div className="flex flex-col items-center gap-2">
                <ThemePreview theme={value} selected={selected} />
                <span
                    className={`text-sm font-semibold ${selected ? "text-primary" : ""}`}
                >
                    {children}
                </span>
            </div>
        </label>
    );
};

export default ThemeLabel;
