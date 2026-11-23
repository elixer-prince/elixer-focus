import type { CountdownSession } from "@/features/countdown-timer/types/session";
import { useCallback, useEffect, useRef, useState } from "react";

const APP_NAME = "Elixer Focus";

function isNotificationSupported() {
  return "Notification" in window;
}

function requestPermission(): Promise<"granted" | "denied" | "default"> {
  if (!isNotificationSupported()) return Promise.resolve("denied");
  return Notification.requestPermission();
}

const useNotification = () => {
  const permissionRef = useRef<NotificationPermission>("default");
  const [notificationPermission, setNotificationPermission] =
    useState<NotificationPermission>("default");
  const [notificationFailed, setNotificationFailed] = useState(false);

  useEffect(() => {
    if (!isNotificationSupported()) return;
    const perm = Notification.permission;
    permissionRef.current = perm;
    setNotificationPermission(perm);
  }, []);

  const requestNotificationPermission = useCallback(async () => {
    if (!isNotificationSupported()) return;
    if (permissionRef.current !== "default") return;
    const result = await requestPermission();
    permissionRef.current = result;
    setNotificationPermission(result);
  }, []);

  const sendTimerEndNotification = useCallback(
    async (sessionType: CountdownSession = "Focus") => {
      if (!isNotificationSupported()) {
        setNotificationFailed(true);
        return;
      }

      // Check the live permission at send time rather than relying on the ref,
      // because the browser may have granted/denied permission after the ref was set.
      let currentPermission = Notification.permission;

      // If permission is still "default" when the timer ends, try requesting it one
      // more time as a last resort. This handles the case where the initial request
      // was silently suppressed by the browser (e.g. Edge adaptive notifications).
      if (currentPermission === "default") {
        try {
          currentPermission = await requestPermission();
          permissionRef.current = currentPermission;
        } catch {
          // Permission request failed; continue with current permission state
        }
      }

      if (currentPermission !== "granted") {
        setNotificationFailed(true);
        return;
      }

      try {
        const notification = new Notification(
          `${APP_NAME} — ${sessionType} ended`,
          {
            body: `Your ${sessionType.toLowerCase()} session has ended.`,
            icon: "/favicon.png",
            tag: "timer-ended",
          },
        );

        let showed = false;

        notification.onshow = () => {
          showed = true;
        };

        notification.onclick = () => {
          window.focus();
          notification.close();
        };

        // Some browsers (e.g. Edge on macOS) create the Notification object
        // without actually displaying it. Wait for the onshow event; if it
        // never fires within 2 seconds, treat the notification as failed.
        setTimeout(() => {
          const notifClosed =
            "closed" in notification &&
            (notification as { closed: boolean }).closed;
          if (!showed && !notifClosed) {
            setNotificationFailed(true);
          }
        }, 2000);
      } catch {
        setNotificationFailed(true);
      }
    },
    [],
  );

  const clearNotificationFailed = useCallback(() => {
    setNotificationFailed(false);
  }, []);

  return {
    requestNotificationPermission,
    sendTimerEndNotification,
    notificationPermission,
    notificationFailed,
    clearNotificationFailed,
  };
};

export default useNotification;
