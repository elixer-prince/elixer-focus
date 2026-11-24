import useNotification from "@/features/countdown-timer/hooks/useNotification";
import { useTimerRunning } from "@/features/countdown-timer/stores/countdown-store";
import { getNotificationSettingsInstruction } from "@/utils/browser";
import { MdNotificationsOff } from "react-icons/md";

const NotificationStatus = () => {
  const timerRunning = useTimerRunning();
  const {
    notificationPermission,
    notificationFailed,
    clearNotificationFailed,
    requestNotificationPermission,
  } = useNotification();

  // Show a warning while the timer runs and notifications are not available.
  const shouldShowWarning =
    timerRunning && notificationPermission !== "granted";

  const systemSettingsPath = getNotificationSettingsInstruction();

  // Show a failure message after the timer ends if the notification couldn't send.
  if (notificationFailed) {
    return (
      <div className="alert alert-error max-w-150 text-xs" role="alert">
        <MdNotificationsOff size={18} />
        <span>
          Desktop notification was not sent.{" "}
          <strong>
            Enable notifications in your browser settings for this site, and in{" "}
            {systemSettingsPath}.
          </strong>
        </span>
        <button
          className="btn btn-xs btn-ghost"
          onClick={clearNotificationFailed}
        >
          ✕
        </button>
      </div>
    );
  }

  if (!shouldShowWarning) return null;

  return (
    <div
      className="alert alert-warning max-w-150 animate-pulse text-xs duration-1000"
      role="alert"
    >
      <MdNotificationsOff size={18} />
      <span>
        Desktop notifications are disabled. You won&apos;t be notified when the
        timer ends.
      </span>
      <button
        className="btn btn-xs btn-primary"
        onClick={requestNotificationPermission}
      >
        Enable notifications
      </button>
      <span className="text-[0.65rem] opacity-70">
        or enable in your browser settings and {systemSettingsPath}
      </span>
    </div>
  );
};

export default NotificationStatus;
