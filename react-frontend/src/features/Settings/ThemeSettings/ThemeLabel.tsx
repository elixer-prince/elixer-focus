import ThemePreview from "@features/Settings/ThemeSettings/ThemePreview";
import { useThemeContext } from "@stores/ThemeContext";
import type { PropsWithChildren } from "react";

type ThemeLabelProps = PropsWithChildren<{
    value: string;
}>;

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
