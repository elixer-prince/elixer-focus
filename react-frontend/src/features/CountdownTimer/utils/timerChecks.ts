export const timerIsAboutToEnd = (remainingSeconds: number) => {
    return remainingSeconds <= 10;
};

export const timerHasEnded = (remainingSeconds: number) => {
    return remainingSeconds <= 0;
};
