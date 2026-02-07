import { create } from "zustand";

type ThemeStore = {
  currentTheme: string;
  setCurrentTheme: (theme: string) => void;
};

export const useThemeStore = create<ThemeStore>((set) => ({
  currentTheme: "dark",
  setCurrentTheme: (theme: string) => set(() => ({ currentTheme: theme })),
}));
