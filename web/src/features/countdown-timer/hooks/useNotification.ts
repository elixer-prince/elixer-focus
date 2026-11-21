import { useCallback, useEffect, useRef } from "react";

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

  useEffect(() => {
    if (!isNotificationSupported()) return;
    permissionRef.current = Notification.permission;
  }, []);

  const requestNotificationPermission = useCallback(async () => {
    if (!isNotificationSupported()) return;
    if (permissionRef.current !== "default") return;
    const result = await requestPermission();
    permissionRef.current = result;
  }, []);

  const sendTimerEndNotification = useCallback(() => {
    if (!isNotificationSupported()) return;
    if (permissionRef.current !== "granted") return;

    const notification = new Notification(`${APP_NAME} — Timer ended`, {
      body: "Your focus session has ended. Time to take a break!",
      icon: "/favicon.png",
      tag: "timer-ended",
    });

    notification.onclick = () => {
      window.focus();
      notification.close();
    };
  }, []);

  return { requestNotificationPermission, sendTimerEndNotification };
};

export default useNotification;
