import { getCurrentTimestamp } from "@utils/date.ts";
import { convertSecondsToMilliseconds } from "@utils/conversion.ts";

export const calculateEndTime = (remainingTimeInSeconds: number) => {
    return (
        getCurrentTimestamp() +
        convertSecondsToMilliseconds(remainingTimeInSeconds)
    );
};

export const calculateRemainingSeconds = (now: number, endTime: number) => {
    return Math.max(0, Math.round((endTime - now) / 1000));
};
