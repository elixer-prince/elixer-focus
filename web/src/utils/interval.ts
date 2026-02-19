export const clearIntervalIfItExists = (intervalRef: {
  current: ReturnType<typeof setInterval> | null;
}) => {
  if (intervalRef.current !== null) {
    clearInterval(intervalRef.current);
    intervalRef.current = null;
  }
};
