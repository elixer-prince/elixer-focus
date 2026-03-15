import { getFromLocalStorage, saveToLocalStorage } from "@/utils/storage";
import { beforeEach } from "vitest";

describe("localStorage functions", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe("saveToLocalStorage", () => {
    it("should save a value to local storage", () => {
      const key = "testKey";
      const value = "Test Value";

      saveToLocalStorage(key, value);

      const storedValue = localStorage.getItem(key);

      expect(storedValue).toBe('"Test Value"');
    });
  });

  describe("getFromLocalStorage", () => {
    it("should return the saved value from local storage", () => {
      const key = "testKey";
      const value = "Test Value";

      saveToLocalStorage(key, value);

      const storedValue = getFromLocalStorage(key);

      expect(storedValue).toBe(value);
    });

    it("should return null if the key does not exist in local storage", () => {
      expect(getFromLocalStorage("nonExistentKey")).toBeNull();
    });
  });
});
