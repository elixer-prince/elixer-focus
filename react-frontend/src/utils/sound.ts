/**
 * Plays a sound effect.
 *
 * @param {HTMLAudioElement} audio
 * @returns {void}
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
    audio.pause();
    audio.currentTime = 0;
}
