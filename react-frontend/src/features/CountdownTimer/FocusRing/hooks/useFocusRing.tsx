import useCountdownTimer from "@features/CountdownTimer/hooks/useCountdownTimer.tsx";
import { convertMinutesToSeconds } from "@utils/conversion.ts";

const UseFocusRing = () => {
    const { startTimeInMinutes, remainingTimeInSeconds } = useCountdownTimer();

    const totalTimeInSeconds = convertMinutesToSeconds(startTimeInMinutes);
    const progress =
        totalTimeInSeconds > 0
            ? (remainingTimeInSeconds / totalTimeInSeconds) * 100
            : 0;

    const radius = 150;
    const circumference = 2 * Math.PI * radius;
    const dashoffset = circumference - (circumference * progress) / 100;

    const angle = 2 * Math.PI * (1 - progress / 100);
    const dotX = 172 + radius * Math.cos(angle);
    const dotY = 172 + radius * Math.sin(angle);

    return { radius, dotX, dotY, dashoffset, circumference };
};

export default UseFocusRing;
