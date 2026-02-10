/**
 * Formats seconds to minutes and seconds to be displayed.
 *
 * @param {string} seconds - The seconds to be formatted.
 * @returns {string} The seconds formatted in minutes and seconds.
 */
export function formatTimeInMinutesAndSeconds(seconds: number): string {
  const sign = seconds < 0 ? "-" : "";  // Check if negative sign is needed
  const absSeconds = Math.abs(seconds); // Always positive

  const minutes = Math.floor(absSeconds / 60);
  const secondsRemainder = absSeconds % 60;

  return `${sign}${minutes.toString().padStart(2, "0")}:${secondsRemainder.toString().padStart(2, "0")}`;
}
