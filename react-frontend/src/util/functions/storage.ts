export function getFromLocalStorage(key: string) {
    return JSON.parse(localStorage.getItem(key) as string);
}

export function saveToLocalStorage(key: string, value: unknown): void {
    localStorage.setItem(key, JSON.stringify(value));
}
