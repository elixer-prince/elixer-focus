import { act, renderHook } from "@testing-library/react";

const loadStore = async () => {
  localStorage.clear();
  vi.resetModules();
  return await import("@/stores/theme");
};

describe("Theme Store", () => {
  it("should initialize with the default theme", async () => {
    const { useCurrentTheme } = await loadStore();

    expect(renderHook(() => useCurrentTheme()).result.current).toBe("dark");
  });

  it("should update the current theme", async () => {
    const { useCurrentTheme, useSetCurrentTheme } = await loadStore();

    const currentTheme = renderHook(() => useCurrentTheme()).result;
    const setCurrentTheme = renderHook(() => useSetCurrentTheme()).result;

    act(() => {
      setCurrentTheme.current("light");
    });

    expect(currentTheme.current).toBe("light");
  });

  it("should persist the theme in localStorage", async () => {
    const { useSetCurrentTheme } = await loadStore();

    const setCurrentTheme = renderHook(() => useSetCurrentTheme()).result;

    act(() => {
      setCurrentTheme.current("light");
    });

    const storedTheme = localStorage.getItem("theme-storage");

    expect(storedTheme).toContain("light");
  });
});
