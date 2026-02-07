import { create } from "zustand";

// useEffect(() => {
//   if (currentTheme) {
//     document.documentElement.setAttribute("data-theme", currentTheme);
//     localStorage.setItem("currentTheme", currentTheme);
//   }
// }, [currentTheme]);

type ThemeStore = {
  currentTheme: string;
  setCurrentTheme: (theme: string) => void;
};

const useThemeStore = create<ThemeStore>((set) => ({
  currentTheme: "dark",
  setCurrentTheme: (theme: string) => set(() => ({ currentTheme: theme })),
}));

export const useCurrentTheme = () =>
  useThemeStore((state) => state.currentTheme);
export const useSetCurrentTheme = () =>
  useThemeStore((state) => state.setCurrentTheme);
