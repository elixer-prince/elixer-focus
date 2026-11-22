import { act, renderHook } from "@testing-library/react";

const mocks = vi.hoisted(() => ({
  requestPermission: vi.fn(),
  close: vi.fn(),
  windowFocus: vi.fn(),
  permissionValue: "default" as NotificationPermission,
  notificationInstances: [] as Array<{
    close: () => void;
    closed: boolean;
    onclick: (() => void) | null;
    onshow: (() => void) | null;
    tag: string;
  }>,
}));

class MockNotification {
  title: string;
  options: NotificationOptions | undefined;
  close = mocks.close;
  closed = false;
  tag = "";
  onclick: (() => void) | null = null;
  onshow: (() => void) | null = null;

  constructor(title: string, options?: NotificationOptions) {
    this.title = title;
    this.options = options;
    this.tag = options?.tag ?? "";
    mocks.notificationInstances.push(this);
  }
}

beforeEach(() => {
  vi.clearAllMocks();
  mocks.permissionValue = "default";
  mocks.requestPermission.mockResolvedValue("granted");
  mocks.close.mockClear();
  mocks.windowFocus.mockClear();
  mocks.notificationInstances = [];

  Object.defineProperty(window, "Notification", {
    value: MockNotification as unknown as typeof Notification,
    writable: true,
    configurable: true,
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window.Notification as any).requestPermission = mocks.requestPermission;
  Object.defineProperty(window.Notification, "permission", {
    get: () => mocks.permissionValue,
    configurable: true,
  });

  Object.defineProperty(window, "focus", {
    value: mocks.windowFocus,
    writable: true,
    configurable: true,
  });
});

afterEach(() => {
  delete (window as unknown as Record<string, unknown>).Notification;
});

import useNotification from "@/features/countdown-timer/hooks/useNotification";

describe("useNotification", () => {
  describe("requestNotificationPermission", () => {
    it("should request permission when current state is default", async () => {
      mocks.permissionValue = "default";

      const { result } = renderHook(() => useNotification());

      await act(async () => {
        await result.current.requestNotificationPermission();
      });

      expect(mocks.requestPermission).toHaveBeenCalledTimes(1);
    });

    it("should not request permission when already granted", async () => {
      mocks.permissionValue = "granted";

      const { result } = renderHook(() => useNotification());

      await act(async () => {
        await result.current.requestNotificationPermission();
      });

      expect(mocks.requestPermission).not.toHaveBeenCalled();
    });

    it("should not request permission when already denied", async () => {
      mocks.permissionValue = "denied";

      const { result } = renderHook(() => useNotification());

      await act(async () => {
        await result.current.requestNotificationPermission();
      });

      expect(mocks.requestPermission).not.toHaveBeenCalled();
    });

    it("should update permission ref after requesting", async () => {
      mocks.permissionValue = "default";
      mocks.requestPermission.mockResolvedValue("granted");

      const { result } = renderHook(() => useNotification());

      await act(async () => {
        await result.current.requestNotificationPermission();
      });

      expect(mocks.requestPermission).toHaveBeenCalled();
    });

    it("should not request again on second call after permission granted", async () => {
      mocks.permissionValue = "default";
      mocks.requestPermission.mockResolvedValue("granted");

      const { result } = renderHook(() => useNotification());

      await act(async () => {
        await result.current.requestNotificationPermission();
      });

      await act(async () => {
        await result.current.requestNotificationPermission();
      });

      expect(mocks.requestPermission).toHaveBeenCalledTimes(1);
    });

    it("should do nothing when Notification API is not supported", async () => {
      delete (window as unknown as Record<string, unknown>).Notification;

      const { result } = renderHook(() => useNotification());

      await act(async () => {
        await result.current.requestNotificationPermission();
      });

      expect(mocks.requestPermission).not.toHaveBeenCalled();
    });
  });

  describe("sendTimerEndNotification", () => {
    it("should create a notification when permission is granted", async () => {
      mocks.permissionValue = "granted";

      const { result } = renderHook(() => useNotification());

      await act(async () => {
        await result.current.sendTimerEndNotification();
      });

      expect(mocks.notificationInstances.length).toBe(1);
      expect(mocks.notificationInstances[0].title).toBe(
        "Elixer Focus — Timer ended",
      );
      expect(mocks.notificationInstances[0].options).toEqual(
        expect.objectContaining({
          body: "Your focus session has ended. Time to take a break!",
          icon: "/favicon.png",
          tag: "timer-ended",
        }),
      );
    });

    it("should set onclick handler to focus window and close notification", async () => {
      mocks.permissionValue = "granted";

      const { result } = renderHook(() => useNotification());

      await act(async () => {
        await result.current.sendTimerEndNotification();
      });

      const notification = mocks.notificationInstances[0];
      expect(notification.onclick).toBeDefined();

      act(() => {
        notification.onclick?.();
      });

      expect(mocks.windowFocus).toHaveBeenCalled();
      expect(mocks.close).toHaveBeenCalled();
    });

    it("should not send notification when permission is denied", async () => {
      mocks.permissionValue = "denied";

      const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      const { result } = renderHook(() => useNotification());

      await act(async () => {
        await result.current.sendTimerEndNotification();
      });

      expect(mocks.notificationInstances.length).toBe(0);
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Notification permission is "denied"'),
      );
      expect(result.current.notificationFailed).toBe(true);
      warnSpy.mockRestore();
    });

    it("should re-request permission when default, then send if granted", async () => {
      mocks.permissionValue = "default";
      mocks.requestPermission.mockResolvedValue("granted");

      const { result } = renderHook(() => useNotification());

      await act(async () => {
        await result.current.sendTimerEndNotification();
      });

      expect(mocks.requestPermission).toHaveBeenCalledTimes(1);
      expect(mocks.notificationInstances.length).toBe(1);
    });

    it("should not send notification when default and re-request is denied", async () => {
      mocks.permissionValue = "default";
      mocks.requestPermission.mockResolvedValue("denied");

      const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      const { result } = renderHook(() => useNotification());

      await act(async () => {
        await result.current.sendTimerEndNotification();
      });

      expect(mocks.requestPermission).toHaveBeenCalledTimes(1);
      expect(mocks.notificationInstances.length).toBe(0);
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Notification permission is "denied"'),
      );
      expect(result.current.notificationFailed).toBe(true);
      warnSpy.mockRestore();
    });

    it("should not send notification when API is not supported", async () => {
      delete (window as unknown as Record<string, unknown>).Notification;

      const { result } = renderHook(() => useNotification());

      await act(async () => {
        await result.current.sendTimerEndNotification();
      });

      expect(mocks.notificationInstances.length).toBe(0);
      expect(result.current.notificationFailed).toBe(true);
    });

    it("should catch and log errors when creating notification fails", async () => {
      const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      const OriginalNotification = window.Notification;
      const ThrowingNotification = class {
        static permission = "granted";
        constructor() {
          throw new Error("Notification construction failed");
        }
      };
      Object.defineProperty(window, "Notification", {
        value: ThrowingNotification as unknown as typeof Notification,
        writable: true,
        configurable: true,
      });

      const { result } = renderHook(() => useNotification());

      await act(async () => {
        await result.current.sendTimerEndNotification();
      });

      expect(errorSpy).toHaveBeenCalledWith(
        expect.stringContaining("Failed to create notification"),
        expect.any(Error),
      );
      expect(result.current.notificationFailed).toBe(true);

      errorSpy.mockRestore();
      Object.defineProperty(window, "Notification", {
        value: OriginalNotification,
        writable: true,
        configurable: true,
      });
    });

    it("should set notificationFailed if onshow does not fire within timeout", async () => {
      mocks.permissionValue = "granted";
      const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
      vi.useFakeTimers();

      const { result } = renderHook(() => useNotification());

      await act(async () => {
        await result.current.sendTimerEndNotification();
      });

      expect(mocks.notificationInstances.length).toBe(1);
      expect(result.current.notificationFailed).toBe(false);

      // Advance past the 2 second timeout
      await act(async () => {
        vi.advanceTimersByTime(2000);
      });

      expect(result.current.notificationFailed).toBe(true);
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining("never showed within 2 seconds"),
      );

      vi.useRealTimers();
      warnSpy.mockRestore();
    });

    it("should not set notificationFailed if onshow fires before timeout", async () => {
      mocks.permissionValue = "granted";
      vi.useFakeTimers();

      const { result } = renderHook(() => useNotification());

      await act(async () => {
        await result.current.sendTimerEndNotification();
      });

      expect(mocks.notificationInstances.length).toBe(1);

      // Trigger the onshow callback
      act(() => {
        mocks.notificationInstances[0].onshow?.();
      });

      // Advance past the 2 second timeout
      await act(async () => {
        vi.advanceTimersByTime(2000);
      });

      expect(result.current.notificationFailed).toBe(false);

      vi.useRealTimers();
    });

    it("should not set notificationFailed if notification is already closed", async () => {
      mocks.permissionValue = "granted";
      const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
      vi.useFakeTimers();

      const { result } = renderHook(() => useNotification());

      await act(async () => {
        await result.current.sendTimerEndNotification();
      });

      // Simulate the notification being closed
      mocks.notificationInstances[0].closed = true;

      await act(async () => {
        vi.advanceTimersByTime(2000);
      });

      expect(result.current.notificationFailed).toBe(false);
      expect(warnSpy).not.toHaveBeenCalledWith(
        expect.stringContaining("never showed within 2 seconds"),
      );

      vi.useRealTimers();
      warnSpy.mockRestore();
    });
  });

  describe("initial permission read", () => {
    it("should read Notification.permission on mount", () => {
      mocks.permissionValue = "granted";

      renderHook(() => useNotification());

      expect(mocks.permissionValue).toBe("granted");
    });

    it("should not crash when Notification API is not supported on mount", () => {
      delete (window as unknown as Record<string, unknown>).Notification;

      expect(() => renderHook(() => useNotification())).not.toThrow();
    });
  });

  describe("notificationPermission state", () => {
    it("should expose the current permission as state on mount", () => {
      mocks.permissionValue = "granted";

      const { result } = renderHook(() => useNotification());

      expect(result.current.notificationPermission).toBe("granted");
    });

    it("should default to default when permission is default", () => {
      mocks.permissionValue = "default";

      const { result } = renderHook(() => useNotification());

      expect(result.current.notificationPermission).toBe("default");
    });

    it("should reflect denied permission on mount", () => {
      mocks.permissionValue = "denied";

      const { result } = renderHook(() => useNotification());

      expect(result.current.notificationPermission).toBe("denied");
    });

    it("should update state after requesting permission", async () => {
      mocks.permissionValue = "default";
      mocks.requestPermission.mockResolvedValue("granted");

      const { result } = renderHook(() => useNotification());

      expect(result.current.notificationPermission).toBe("default");

      await act(async () => {
        await result.current.requestNotificationPermission();
      });

      expect(result.current.notificationPermission).toBe("granted");
    });

    it("should update state to denied when request is denied", async () => {
      mocks.permissionValue = "default";
      mocks.requestPermission.mockResolvedValue("denied");

      const { result } = renderHook(() => useNotification());

      await act(async () => {
        await result.current.requestNotificationPermission();
      });

      expect(result.current.notificationPermission).toBe("denied");
    });

    it("should default to default when Notification API is not supported", () => {
      delete (window as unknown as Record<string, unknown>).Notification;

      const { result } = renderHook(() => useNotification());

      expect(result.current.notificationPermission).toBe("default");
    });
  });

  describe("notificationFailed state", () => {
    it("should start with notificationFailed as false", () => {
      const { result } = renderHook(() => useNotification());

      expect(result.current.notificationFailed).toBe(false);
    });

    it("should set notificationFailed to true when permission is denied", async () => {
      mocks.permissionValue = "denied";

      const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      const { result } = renderHook(() => useNotification());

      await act(async () => {
        await result.current.sendTimerEndNotification();
      });

      expect(result.current.notificationFailed).toBe(true);
      warnSpy.mockRestore();
    });

    it("should set notificationFailed to true when API is not supported", async () => {
      delete (window as unknown as Record<string, unknown>).Notification;

      const { result } = renderHook(() => useNotification());

      await act(async () => {
        await result.current.sendTimerEndNotification();
      });

      expect(result.current.notificationFailed).toBe(true);
    });

    it("should not set notificationFailed when notification sends successfully", async () => {
      mocks.permissionValue = "granted";

      const { result } = renderHook(() => useNotification());

      await act(async () => {
        await result.current.sendTimerEndNotification();
      });

      expect(result.current.notificationFailed).toBe(false);
    });

    it("should clear notificationFailed when clearNotificationFailed is called", () => {
      const { result } = renderHook(() => useNotification());

      act(() => {
        result.current.clearNotificationFailed();
      });

      expect(result.current.notificationFailed).toBe(false);
    });
  });
});
