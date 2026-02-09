/**
 * Converts minutes to seconds.
 *
 * @param {number} minutes - The minutes to be converted to seconds.
 * @returns {number} The minutes converted to seconds.
 */
export function convertMinutesToSeconds(minutes: number): number {
  return minutes * 60;
}

/**
 * Converts minutes to milliseconds.
 *
 * @param {number} minutes - The minutes to be converted to milliseconds.
 * @returns {number} The minutes converted to milliseconds.
 */
export function convertMinutesToMilliseconds(minutes: number): number {
  return convertMinutesToSeconds(minutes) * 1000;
}

/**
 * Converts seconds to minutes.
 *
 * @param {number} seconds - The seconds to be converted to minutes.
 * @returns {number} The seconds converted to minutes.
 */
export function convertSecondsToMinutes(seconds: number): number {
  return seconds / 60;
}

/**
 * Converts seconds to milliseconds.
 *
 * @param {number} seconds - The seconds to be converted to milliseconds.
 * @returns {number} The seconds converted to milliseconds.
 */
export function convertSecondsToMilliseconds(seconds: number): number {
  return seconds * 1000;
}

/**
 * Converts milliseconds to seconds.
 *
 * @param {number} milliseconds - The milliseconds to be converted to seconds.
 * @returns {number} The milliseconds converted to seconds.
 */
export function convertMillisecondsToSeconds(milliseconds: number): number {
  return milliseconds / 1000;
}
