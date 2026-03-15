export function getFromLocalStorage<T>(key: string): T | null {
  const storedItem = localStorage.getItem(key);
  if (!storedItem) return null;
  return JSON.parse(storedItem);
}

export function saveToLocalStorage<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}
