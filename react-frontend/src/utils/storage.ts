export function getFromLocalStorage(key: string) {
    const storedItem = localStorage.getItem(key);

    if (storedItem === null || storedItem === "undefined") {
        return null;
    }

    try {
        return JSON.parse(storedItem);
    } catch (error) {
        console.error(`Error parsing localStorage key "${key}":`, error);
        return null;
    }
}

export function saveToLocalStorage<Type>(key: string, value: Type): void {
    localStorage.setItem(key, JSON.stringify(value));
}
