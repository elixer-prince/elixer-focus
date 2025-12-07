import useCountdownTimerContext from "@features/CountdownTimer/hooks/useCountdownTimerContext.tsx";
import { convertMinutesToSeconds } from "@utils/conversion.ts";

const useFocusRing = () => {
    const { startTimeInMinutes, remainingTimeInSeconds } =
        useCountdownTimerContext();

    const totalTimeInSeconds = convertMinutesToSeconds(startTimeInMinutes);

    const elapsed = Math.max(0, totalTimeInSeconds - remainingTimeInSeconds);

    const rawProgress =
        totalTimeInSeconds > 0 ? elapsed / totalTimeInSeconds : 0;

    // Clamp just in case (0 → 1)
    const progress = Math.min(Math.max(rawProgress, 0), 1);

    const radius = 150;
    const circumference = 2 * Math.PI * radius;

    // Ring EMPTIES as time passes (start full → end empty)
    const dashoffset = circumference * progress;

    // Dot moves COUNTERCLOCKWISE with the emptying ring
    const angle = -2 * Math.PI * progress;
    const dotX = 172 + radius * Math.cos(angle);
    const dotY = 172 + radius * Math.sin(angle);

    return { radius, dotX, dotY, dashoffset, circumference };
};

export default useFocusRing;
