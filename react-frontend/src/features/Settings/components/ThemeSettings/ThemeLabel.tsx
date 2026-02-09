import ThemePreview from "@/features/Settings/components/ThemeSettings/ThemePreview";
import { useCurrentTheme, useSetCurrentTheme } from "@/stores/theme.ts";
import type { PropsWithChildren } from "react";

type ThemeLabelProps = {
  value: string;
};

const ThemeLabel = ({
  value,
  children,
}: PropsWithChildren<ThemeLabelProps>) => {
  const currentTheme = useCurrentTheme();
  const setCurrentTheme = useSetCurrentTheme();
  const selected = currentTheme === value;

  return (
    <label className={"cursor-pointer"}>
      {/* Hide the radio, keep accessibility */}
      <input
        type={"radio"}
        name={"theme-radios"}
        className={"sr-only"}
        value={value}
        checked={selected}
        onChange={() => setCurrentTheme(value)}
      />

      {/* The visible clickable square */}
      <div className={"flex flex-col items-center gap-2"}>
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
