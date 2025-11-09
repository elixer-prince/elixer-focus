export function formatTimeInMinutesAndSeconds(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const secondsRemainder = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${secondsRemainder.toString().padStart(2, "0")}`;
}
