export const timerIsAboutToEnd = (remainingSeconds: number): boolean => {
  return remainingSeconds <= 10 && remainingSeconds > 0;
};

export const timerHasEnded = (remainingSeconds: number): boolean => {
  return remainingSeconds <= 0;
};
