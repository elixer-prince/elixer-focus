export { getCurrentTimestamp } from "@elixer-focus/shared/utils";

/**
 * Formats a timestamp as a relative time string (e.g., "2 hours ago").
 *
 * @param timestamp - The timestamp to format.
 * @returns {string} A human-readable relative time string.
 */
export const formatRelativeTime = (timestamp: number): string => {
  const now = Date.now();
  const diff = now - timestamp;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
};
