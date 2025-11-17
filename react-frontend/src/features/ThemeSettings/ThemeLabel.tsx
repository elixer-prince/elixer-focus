import type {ReactNode} from "react";

interface ThemeLabelProps {
    value: string;
    children: ReactNode;
}

const ThemeLabel = ({ value, children }: ThemeLabelProps) => {
    return (
        <label className="flex cursor-pointer items-center gap-2">
            <input
                type="radio"
                name="theme-radios"
                className="radio radio-sm theme-controller"
                value={value}
            />
            {children}
        </label>
    );
};

export default ThemeLabel;
