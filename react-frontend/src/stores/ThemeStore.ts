import { create } from "zustand";

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

const useThemeStore = create<ThemeState & ThemeActions>((set) => ({
  currentTheme: "dark",
  setCurrentTheme: (theme: string) => set(() => ({ currentTheme: theme })),
}));

export const useCurrentTheme = () =>
  useThemeStore((state) => state.currentTheme);

export const useSetCurrentTheme = () =>
  useThemeStore((state) => state.setCurrentTheme);
