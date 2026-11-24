import { create } from "zustand";
import { createPersistOptions, persist, simpleMigrate } from "./persist-config";

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
    createPersistOptions<ThemeState & ThemeActions>({
      name: "theme-storage",
      version: 1,
      migrate: simpleMigrate<ThemeState & ThemeActions>,
    }),
  ),
);

export const useCurrentTheme = () =>
  useThemeStore((state) => state.currentTheme);

export const useSetCurrentTheme = () =>
  useThemeStore((state) => state.setCurrentTheme);
