export function getFromLocalStorage(key: string) {
    return JSON.parse(localStorage.getItem(key) as string);
}

export function saveToLocalStorage<Type>(key: string, value: Type): void {
    localStorage.setItem(key, JSON.stringify(value));
}
