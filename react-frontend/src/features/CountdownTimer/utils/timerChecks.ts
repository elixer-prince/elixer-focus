/**
 * This checks if the timer is about to end by checking if the remaining
 * seconds is less than 10.
 *
 * @param {number} remainingSeconds - The amount of seconds remaining.
 * @returns {boolean} If the timer is about to end or not.
 */
export const timerIsAboutToEnd = (remainingSeconds: number): boolean => {
  return remainingSeconds <= 10;
};

/**
 * This checks if the timer has ended by checking if the remaining seconds is
 * less than or equal to 0.
 *
 * @param {number} remainingSeconds - The amount of seconds remaining.
 * @returns {boolean} If the timer is about to end or not.
 */
export const timerHasEnded = (remainingSeconds: number): boolean => {
  return remainingSeconds <= 0;
};
