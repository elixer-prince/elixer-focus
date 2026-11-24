import { validThemeNames } from "@/config/themes";
import { useCurrentTheme, useSetCurrentTheme } from "@/stores/theme";
import { useLayoutEffect, useState } from "react";

interface UseAppThemeResult {
  currentTheme: string;
  setTheme: (theme: string) => void;
  isValidTheme: boolean;
  error: string | null;
}

const useAppTheme = (): UseAppThemeResult => {
  const storeTheme = useCurrentTheme();
  const setStoreTheme = useSetCurrentTheme();
  const [error, setError] = useState<string | null>(null);

  // Validate theme is in the list of valid themes
  const isValidTheme = validThemeNames.has(storeTheme);

  // Apply theme to HTML element when store theme changes
  useLayoutEffect(() => {
    // Skip during SSR - document doesn't exist on server
    if (typeof document === "undefined") {
      return;
    }

    const themeToApply = storeTheme || "dark";

    // Validate theme before applying
    if (storeTheme && !validThemeNames.has(storeTheme)) {
      setStoreTheme("dark");
      return;
    }

    try {
      const htmlElement = document.documentElement;
      const previousTheme = htmlElement.dataset.theme;

      // Only update if theme actually changed
      if (previousTheme !== themeToApply) {
        htmlElement.dataset.theme = themeToApply;
        setError(null);
      }
    } catch (err) {
      const errorMsg = `[Theme] Failed to apply theme: ${err}`;
      setError(errorMsg);
    }
  }, [storeTheme, setStoreTheme]);

  // Wrapper function with validation
  const setTheme = (theme: string) => {
    if (!validThemeNames.has(theme)) {
      const errorMsg = `Invalid theme: ${theme}`;
      setError(errorMsg);
      return;
    }
    setError(null);
    setStoreTheme(theme);
  };

  return {
    currentTheme: storeTheme || "dark",
    setTheme,
    isValidTheme,
    error,
  };
};

export default useAppTheme;
