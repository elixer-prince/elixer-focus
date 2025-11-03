export function playSound(effect: HTMLAudioElement) {
    effect.currentTime = 0;
    effect.play();
}

export function stopSound(effect: HTMLAudioElement) {
    effect.pause();
    effect.currentTime = 0;
}
