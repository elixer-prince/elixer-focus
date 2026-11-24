/**
 * Detects the user's operating system from the browser user agent string.
 * Returns a simple label for use in user-facing messages.
 */
export function getOSLabel(): string {
  if (typeof navigator === "undefined") return "your";

  const { userAgent } = navigator;

  if (/Mac|iPhone|iPad|iPod/.test(userAgent)) return "macOS";
  if (/Windows/.test(userAgent)) return "Windows";
  if (/Linux/.test(userAgent)) return "Linux";

  return "your";
}

/**
 * Returns the system settings path for notifications, based on the detected OS.
 */
export function getNotificationSettingsInstruction(): string {
  const os = getOSLabel();

  switch (os) {
    case "macOS":
      return "System Settings > Notifications";
    case "Windows":
      return "Settings > Privacy & security > Notifications";
    case "Linux":
      return "your system notification settings";
    default:
      return "your system notification settings";
  }
}
