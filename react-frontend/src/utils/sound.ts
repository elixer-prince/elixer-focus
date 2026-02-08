/**
 * Plays a sound effect by first pausing and restarting it from the start.
 *
 * @param {HTMLAudioElement} sound
 * @returns {void}
 */
export function playSound(sound: HTMLAudioElement): void {
  if (!sound) return;

  try {
    stopSound(sound);
    sound.play();
  } catch (error) {
    console.error(error);
  }
}

/**
 * Pauses a sound effect.
 *
 * @param {HTMLAudioElement} sound
 * @returns {void}
 */
export function stopSound(sound: HTMLAudioElement): void {
  if (!sound) return;

  try {
    sound.pause();
    sound.currentTime = 0;
  } catch (error) {
    console.error(error);
  }
}
