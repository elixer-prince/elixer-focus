export function convertMinutesToSeconds(minutes: number): number {
  return minutes * 60;
}

export function convertMinutesToMilliseconds(minutes: number): number {
  return convertMinutesToSeconds(minutes) * 1000;
}

export function convertSecondsToMinutes(seconds: number): number {
  return seconds / 60;
}

export function convertSecondsToMilliseconds(seconds: number): number {
  return seconds * 1000;
}

export function convertMillisecondsToSeconds(milliseconds: number): number {
  return milliseconds / 1000;
}
