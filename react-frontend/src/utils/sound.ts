/**
 * Plays a sound effect by first pausing and restarting it from the start.
 *
 * @param {HTMLAudioElement} audio
 */
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
        console.error(error);
    }
};

/**
 * Pauses a sound effect.
 *
 * @param {HTMLAudioElement} audio
 * @returns {void}
 */
export function stopSound(audio: HTMLAudioElement): void {
    if (!audio) return;
    audio.pause();
    audio.currentTime = 0;
}
