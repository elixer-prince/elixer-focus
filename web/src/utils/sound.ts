export function playSound(sound: HTMLAudioElement): void {
  if (!sound) return;

  try {
    stopSound(sound);
    sound.play().catch((error) => {
      // The play() promise rejects with AbortError if pause() is called
      // before playback starts. This is expected when the user skips or
      // resets the timer while a sound is starting.
      if (error.name === "AbortError") return;
    });
  } catch {
    // Failed to play sound
  }
}

export function stopSound(sound: HTMLAudioElement): void {
  if (!sound) return;

  try {
    sound.pause();
    sound.currentTime = 0;
  } catch {
    // Failed to pause sound
  }
}
