import type { CountdownSession } from "@/features/countdown-timer/types/session";
import { getNotificationSettingsInstruction } from "@/utils/browser";
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
      console.log(
        `[${APP_NAME}] sendTimerEndNotification called with session type: ${sessionType}`,
      );

      if (!isNotificationSupported()) {
        console.warn(
          `[${APP_NAME}] Notification API not supported in this browser`,
        );
        setNotificationFailed(true);
        return;
      }

      // Check the live permission at send time rather than relying on the ref,
      // because the browser may have granted/denied permission after the ref was set.
      let currentPermission = Notification.permission;
      console.log(
        `[${APP_NAME}] Live notification permission: "${currentPermission}"`,
      );

      // If permission is still "default" when the timer ends, try requesting it one
      // more time as a last resort. This handles the case where the initial request
      // was silently suppressed by the browser (e.g. Edge adaptive notifications).
      if (currentPermission === "default") {
        console.log(`[${APP_NAME}] Permission is "default", re-requesting...`);
        try {
          currentPermission = await requestPermission();
          permissionRef.current = currentPermission;
          console.log(
            `[${APP_NAME}] Re-requested permission result: "${currentPermission}"`,
          );
        } catch (error) {
          console.error(`[${APP_NAME}] Error re-requesting permission:`, error);
        }
      }

      if (currentPermission !== "granted") {
        setNotificationFailed(true);
        const settingsPath = getNotificationSettingsInstruction();
        console.warn(
          `[${APP_NAME}] Notification permission is "${currentPermission}", not "granted". ` +
            "The timer end notification was not sent. To enable notifications: " +
            `1. Allow notifications in your browser settings for this site. ` +
            `2. Enable notifications for your browser in ${settingsPath}.`,
        );
        return;
      }

      try {
        console.log(`[${APP_NAME}] Creating notification...`);
        const notification = new Notification(
          `${APP_NAME} — ${sessionType} ended`,
          {
            body: `Your ${sessionType.toLowerCase()} session has ended.`,
            icon: "/favicon.png",
            tag: "timer-ended",
          },
        );

        console.log(`[${APP_NAME}] Notification created successfully`);

        let showed = false;

        notification.onshow = () => {
          showed = true;
          console.log(`[${APP_NAME}] Notification showed successfully`);
        };

        notification.onclick = () => {
          console.log(`[${APP_NAME}] Notification clicked`);
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
            console.warn(
              `[${APP_NAME}] Notification was created but never showed within 2 seconds. ` +
                "This may be a browser limitation (e.g. Edge on macOS). " +
                "The audio beep should still play as a fallback alert.",
            );
          }
        }, 2000);
      } catch (error) {
        setNotificationFailed(true);
        console.error(`[${APP_NAME}] Failed to create notification:`, error);
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
