import ThemePreview from "@/features/settings/theme/components/ThemePreview";
import { useCurrentTheme, useSetCurrentTheme } from "@/stores/theme";
import type { PropsWithChildren } from "react";

interface ThemeLabelProps {
  value: string;
  onThemeChange?: (theme: string) => void;
}

const ThemeLabel = ({
  value,
  children,
  onThemeChange,
}: PropsWithChildren<ThemeLabelProps>) => {
  const currentTheme = useCurrentTheme();
  const setCurrentTheme = useSetCurrentTheme();
  const selected = currentTheme === value;

  const handleChange = () => {
    setCurrentTheme(value);
    onThemeChange?.(value);
  };

  return (
    <label className={"cursor-pointer"}>
      {/* Hide the radio, keep accessibility */}
      <input
        type={"radio"}
        name={"theme-radios"}
        className={"sr-only"}
        value={value}
        checked={selected}
        onChange={handleChange}
      />

      {/* Card container */}
      <div
        className={`group bg-base-100 flex flex-col overflow-hidden rounded-xl border transition-all duration-500 ${
          selected
            ? "border-primary shadow-md"
            : "border-base-300 hover:border-primary/50 hover:shadow-lg"
        }`}
      >
        <ThemePreview theme={value} selected={selected} />
        <div className={"px-3 pt-2 pb-3"}>
          <span
            className={`text-sm font-semibold transition-colors duration-500 ${
              selected ? "text-primary" : "text-base-content"
            }`}
          >
            {children}
          </span>
        </div>
      </div>
    </label>
  );
};

export default ThemeLabel;
