import { beforeEach } from "vitest";
import { getFromLocalStorage, saveToLocalStorage } from "@/utils/storage";

describe("localStorage functions", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("should return the value from local storage", () => {
    const value = "Test Value";

    saveToLocalStorage("testKey", value);

    const storedValue = getFromLocalStorage("testKey");

    expect(value).toBe(storedValue);
    expect(storedValue).toBe("Test Value");
  });
});
