/*
|----------------------------------------------------------------
|  STORAGE FUNCTIONS
|----------------------------------------------------------------
|
*/

export function getFromLocalStorage(key: string) {
    return JSON.parse(localStorage.getItem(key) as string);
}

export function saveToLocalStorage(key: string, value: any) {
    localStorage.setItem(key, JSON.stringify(value));
}

/*
|----------------------------------------------------------------
|  SOUND FUNCTIONS
|----------------------------------------------------------------
|
*/

export function playSound(effect: any) {
    effect.currentTime = 0;
    effect.play();
}

export function stopSound(effect: any) {
    effect.pause();
    effect.currentTime = 0;
}
