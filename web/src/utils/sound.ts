export function playSound(sound: HTMLAudioElement): void {
  if (!sound) return;

  try {
    stopSound(sound);
    sound.play();
  } catch (error) {
    console.error(`Error playing sound: ${sound.src}`, error);
  }
}

export function stopSound(sound: HTMLAudioElement): void {
  if (!sound) return;

  try {
    sound.pause();
    sound.currentTime = 0;
  } catch (error) {
    console.error(`Error pausing sound: ${sound.src}`, error);
  }
}
