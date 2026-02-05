/**
 * Formats seconds to minutes and seconds to be displayed.
 *
 * @param {string} seconds - The seconds to be formatted.
 * @returns {string} The seconds formatted in minutes and seconds.
 */
export function formatTimeInMinutesAndSeconds(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const secondsRemainder = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${secondsRemainder.toString().padStart(2, "0")}`;
}
