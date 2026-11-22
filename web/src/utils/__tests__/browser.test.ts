import {
  getOSLabel,
  getNotificationSettingsInstruction,
} from "@/utils/browser";

describe("browser utils", () => {
  const originalNavigator = globalThis.navigator;

  afterEach(() => {
    Object.defineProperty(globalThis, "navigator", {
      value: originalNavigator,
      writable: true,
    });
  });

  describe("getOSLabel", () => {
    it("should return 'macOS' for Mac user agents", () => {
      Object.defineProperty(globalThis, "navigator", {
        value: { userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)" },
        writable: true,
      });

      expect(getOSLabel()).toBe("macOS");
    });

    it("should return 'macOS' for iPhone user agents", () => {
      Object.defineProperty(globalThis, "navigator", {
        value: {
          userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X)",
        },
        writable: true,
      });

      expect(getOSLabel()).toBe("macOS");
    });

    it("should return 'macOS' for iPad user agents", () => {
      Object.defineProperty(globalThis, "navigator", {
        value: { userAgent: "Mozilla/5.0 (iPad; CPU OS 16_0 like Mac OS X)" },
        writable: true,
      });

      expect(getOSLabel()).toBe("macOS");
    });

    it("should return 'Windows' for Windows user agents", () => {
      Object.defineProperty(globalThis, "navigator", {
        value: { userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" },
        writable: true,
      });

      expect(getOSLabel()).toBe("Windows");
    });

    it("should return 'Linux' for Linux user agents", () => {
      Object.defineProperty(globalThis, "navigator", {
        value: { userAgent: "Mozilla/5.0 (X11; Linux x86_64)" },
        writable: true,
      });

      expect(getOSLabel()).toBe("Linux");
    });

    it("should return 'your' for unknown user agents", () => {
      Object.defineProperty(globalThis, "navigator", {
        value: { userAgent: "Mozilla/5.0 (Unknown)" },
        writable: true,
      });

      expect(getOSLabel()).toBe("your");
    });

    it("should return 'your' when navigator is not available", () => {
      Object.defineProperty(globalThis, "navigator", {
        value: undefined,
        writable: true,
      });

      expect(getOSLabel()).toBe("your");
    });
  });

  describe("getNotificationSettingsInstruction", () => {
    it("should return macOS settings path for Mac", () => {
      Object.defineProperty(globalThis, "navigator", {
        value: { userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)" },
        writable: true,
      });

      expect(getNotificationSettingsInstruction()).toBe(
        "System Settings > Notifications",
      );
    });

    it("should return Windows settings path for Windows", () => {
      Object.defineProperty(globalThis, "navigator", {
        value: { userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" },
        writable: true,
      });

      expect(getNotificationSettingsInstruction()).toBe(
        "Settings > Privacy & security > Notifications",
      );
    });

    it("should return generic path for Linux", () => {
      Object.defineProperty(globalThis, "navigator", {
        value: { userAgent: "Mozilla/5.0 (X11; Linux x86_64)" },
        writable: true,
      });

      expect(getNotificationSettingsInstruction()).toBe(
        "your system notification settings",
      );
    });

    it("should return generic path for unknown OS", () => {
      Object.defineProperty(globalThis, "navigator", {
        value: { userAgent: "Mozilla/5.0 (Unknown)" },
        writable: true,
      });

      expect(getNotificationSettingsInstruction()).toBe(
        "your system notification settings",
      );
    });
  });
});
