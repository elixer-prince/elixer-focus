export const playSound = async (audio?: HTMLAudioElement | null) => {
    if (!audio) return;

    try {
        // Only pause if the audio is actually playing
        if (!audio.paused) {
            audio.pause();
        }
        audio.currentTime = 0;
        await audio.play();
    } catch (error) {
        // Ignore AbortError (happens when play is interrupted)
        if (error instanceof Error && error.name !== "AbortError") {
            console.warn("Sound play error:", error);
        }
    }
};

export function stopSound(effect: HTMLAudioElement): void {
    effect.pause();
    effect.currentTime = 0;
}
