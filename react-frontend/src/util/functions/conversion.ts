export function convertMinutesToSeconds(minutes: number): number {
    return minutes * 60;
}

export function convertMinutesToMilliseconds(minutes: number): number {
    return convertMinutesToSeconds(minutes) * 1000;
}
