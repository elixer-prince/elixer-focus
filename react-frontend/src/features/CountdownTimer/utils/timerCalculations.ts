import { getCurrentTimestamp } from "@utils/date.ts";
import { convertSecondsToMilliseconds } from "@utils/conversion.ts";

/**
 * Calculates the countdown timer's end time based on the amount of seconds remaining.
 *
 * @param {number} remainingTimeInSeconds - The current remaining time in seconds.
 * @returns {number} The current remaining time in milliseconds added to the current timestamp.
 * */
export const calculateEndTime = (remainingTimeInSeconds: number): number => {
    return (
        getCurrentTimestamp() +
        convertSecondsToMilliseconds(remainingTimeInSeconds)
    );
};

/**
 * Calculates the remaining time in seconds based on the timer's calculated end time.
 *
 * @param {number} now - The current timestamp in milliseconds.
 * @param {number} endTime - The end time in milliseconds.
 * @returns {number} The remaining time in seconds.
 * */
export const calculateRemainingSeconds = (
    now: number,
    endTime: number,
): number => {
    // Math.max() is used here to ensure the remaining seconds is never less
    // than zero.
    return Math.max(0, Math.round((endTime - now) / 1000));
};
