export const convertMinutesToSeconds = (minutes: number) => {
    return minutes * 60;
};

export const convertMinutesToMilliseconds = (minutes: number) => {
    return convertMinutesToSeconds(minutes) * 1000;
};
