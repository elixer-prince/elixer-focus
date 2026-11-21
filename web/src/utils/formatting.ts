export function formatTimeInMinutesAndSeconds(seconds: number): string {
  const sign = seconds < 0 ? "-" : ""; // Check if negative sign is needed
  const absSeconds = Math.abs(seconds); // Always positive

  const minutes = Math.floor(absSeconds / 60);
  const secondsRemainder = absSeconds % 60;

  return `${sign}${minutes.toString().padStart(2, "0")}:${secondsRemainder.toString().padStart(2, "0")}`;
}

export function formatElapsedTime(seconds: number): string {
  const totalMinutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  if (totalMinutes >= 60) {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    if (hours > 1 && minutes > 1) {
      return `${hours} hours and ${minutes} minutes`;
    }
    if (hours > 1 && minutes === 1) {
      return `${hours} hours and 1 minute`;
    }
    if (hours > 1 && minutes === 0) {
      return `${hours} hours`;
    }
    if (hours === 1 && minutes > 1) {
      return `1 hour and ${minutes} minutes`;
    }
    if (hours === 1 && minutes === 1) {
      return "1 hour and 1 minute";
    }
    return "1 hour";
  }

  if (totalMinutes > 0) {
    if (totalMinutes === 1 && remainingSeconds > 0) {
      return `1 minute and ${remainingSeconds} seconds`;
    }
    if (totalMinutes === 1 && remainingSeconds === 0) {
      return "1 minute";
    }
    if (remainingSeconds > 0) {
      return `${totalMinutes} minutes and ${remainingSeconds} seconds`;
    }
    return `${totalMinutes} minutes`;
  }

  if (remainingSeconds === 1) {
    return "1 second";
  }
  return `${remainingSeconds} seconds`;
}
