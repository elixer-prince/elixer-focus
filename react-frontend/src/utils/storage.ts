/**
 * Returns the value of the item stored in local storage.
 *
 * @param {string} key - The key of the item in local storage.
 * @returns The value of the stored item from local storage.
 */
export function getFromLocalStorage<T>(key: string): T | undefined {
  const storedItem = localStorage.getItem(key);
  if (!storedItem) return;
  return JSON.parse(storedItem);
}

/**
 * Saves a value to local storage.
 *
 * @param {string} key - The key that the item should be given in local storage.
 * @param {any} value - The value to be stored in local storage.
 * @returns {void}
 */
export function saveToLocalStorage<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}
