import { act, renderHook } from "@testing-library/react";

const mocks = vi.hoisted(() => ({
  requestPermission: vi.fn(),
  close: vi.fn(),
  windowFocus: vi.fn(),
  permissionValue: "default" as NotificationPermission,
  notificationInstances: [] as Array<{
    close: () => void;
    onclick: (() => void) | null;
  }>,
}));

class MockNotification {
  title: string;
  options: NotificationOptions | undefined;
  close = mocks.close;
  onclick: (() => void) | null = null;

  constructor(title: string, options?: NotificationOptions) {
    this.title = title;
    this.options = options;
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
    it("should create a notification when permission is granted", () => {
      mocks.permissionValue = "granted";

      const { result } = renderHook(() => useNotification());

      act(() => {
        result.current.sendTimerEndNotification();
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

    it("should set onclick handler to focus window and close notification", () => {
      mocks.permissionValue = "granted";

      const { result } = renderHook(() => useNotification());

      act(() => {
        result.current.sendTimerEndNotification();
      });

      const notification = mocks.notificationInstances[0];
      expect(notification.onclick).toBeDefined();

      act(() => {
        notification.onclick?.();
      });

      expect(mocks.windowFocus).toHaveBeenCalled();
      expect(mocks.close).toHaveBeenCalled();
    });

    it("should not send notification when permission is denied", () => {
      mocks.permissionValue = "denied";

      const { result } = renderHook(() => useNotification());

      act(() => {
        result.current.sendTimerEndNotification();
      });

      expect(mocks.notificationInstances.length).toBe(0);
    });

    it("should not send notification when permission is default", () => {
      mocks.permissionValue = "default";

      const { result } = renderHook(() => useNotification());

      act(() => {
        result.current.sendTimerEndNotification();
      });

      expect(mocks.notificationInstances.length).toBe(0);
    });

    it("should not send notification when API is not supported", () => {
      delete (window as unknown as Record<string, unknown>).Notification;

      const { result } = renderHook(() => useNotification());

      act(() => {
        result.current.sendTimerEndNotification();
      });

      expect(mocks.notificationInstances.length).toBe(0);
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
});
