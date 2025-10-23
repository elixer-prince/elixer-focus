/*
|----------------------------------------------------------------
|  TIMER CONVERSIONS
|----------------------------------------------------------------
|
*/

export const convertMinutesToSeconds = (minutes: number) => {
    return minutes * 60;
};

/*
|----------------------------------------------------------------
|  TIMER FORMATTING
|----------------------------------------------------------------
|
*/

export const formatTimeInMinutesAndSeconds = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secondsRemainder = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${secondsRemainder.toString().padStart(2, "0")}`;
};
