export function playSound(effect: HTMLAudioElement): void {
    effect.currentTime = 0;
    effect.play();
}

export function stopSound(effect: HTMLAudioElement): void {
    effect.pause();
    effect.currentTime = 0;
}
