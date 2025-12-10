export const playSound = (audio?: HTMLAudioElement | null) => {
    if (!audio) return;

    try {
        audio.pause(); // Stop any current playback
        audio.currentTime = 0; // Rewind to start
        void audio.play(); // Play fresh (ignore the Promise)
    } catch {
        // Optional: log or ignore
    }
};

export function stopSound(effect: HTMLAudioElement): void {
    effect.pause();
    effect.currentTime = 0;
}
