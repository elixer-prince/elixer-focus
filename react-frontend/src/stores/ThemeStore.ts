import { create } from "zustand";
import { persist } from "zustand/middleware";

// useEffect(() => {
//   if (currentTheme) {
//     document.documentElement.setAttribute("data-theme", currentTheme);
//     localStorage.setItem("currentTheme", currentTheme);
//   }
// }, [currentTheme]);

type ThemeState = {
  currentTheme: string;
};

type ThemeActions = {
  setCurrentTheme: (theme: string) => void;
};

const useThemeStore = create<ThemeState & ThemeActions>()(
  persist(
    (set) => ({
      currentTheme: "dark",
      setCurrentTheme: (theme: string) => set(() => ({ currentTheme: theme })),
    }),
    { name: "theme-storage" },
  ),
);

export const useCurrentTheme = () =>
  useThemeStore((state) => state.currentTheme);

export const useSetCurrentTheme = () =>
  useThemeStore((state) => state.setCurrentTheme);
