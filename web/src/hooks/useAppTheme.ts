import { useCurrentTheme, useSetCurrentTheme } from "@/stores/theme";
import { useEffect, useState } from "react";

// List of valid DaisyUI themes for validation
const VALID_THEMES = new Set<string>([
  "light",
  "dark",
  "cupcake",
  "bumblebee",
  "emerald",
  "corporate",
  "synthwave",
  "retro",
  "cyberpunk",
  "valentine",
  "halloween",
  "garden",
  "forest",
  "aqua",
  "lofi",
  "pastel",
  "fantasy",
  "wireframe",
  "black",
  "luxury",
  "dracula",
  "cmyk",
  "autumn",
  "business",
  "acid",
  "lemonade",
  "night",
  "coffee",
  "winter",
  "dim",
  "nord",
  "sunset",
  "caramellatte",
  "abyss",
  "silk",
]);

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
  const isValidTheme = Array.from(VALID_THEMES).includes(storeTheme);

  // Apply theme to HTML element when store theme changes
  useEffect(() => {
    // Skip during SSR - document doesn't exist on server
    if (typeof document === "undefined") {
      return;
    }

    const themeToApply = storeTheme || "dark";

    // Validate theme before applying
    if (storeTheme && !Array.from(VALID_THEMES).includes(storeTheme)) {
      setStoreTheme("dark");
      return;
    }

    try {
      const htmlElement = document.documentElement;
      const previousTheme = htmlElement.dataset.theme;

      // Only update if theme actually changed
      if (previousTheme !== themeToApply) {
        htmlElement.dataset.theme = themeToApply;
        console.log(`[Theme] Applied theme: ${themeToApply}`);
        setError(null);
      }
    } catch (err) {
      const errorMsg = `[Theme] Failed to apply theme: ${err}`;
      console.error(errorMsg);
      setError(errorMsg);
    }
  }, [storeTheme, setStoreTheme]);

  // Wrapper function with validation
  const setTheme = (theme: string) => {
    if (!VALID_THEMES.has(theme)) {
      const errorMsg = `Invalid theme: ${theme}`;
      console.error(`[Theme] ${errorMsg}`);
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
