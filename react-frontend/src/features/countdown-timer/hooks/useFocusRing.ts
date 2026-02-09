import {
  useRemainingTimeInSeconds,
  useStartTimeInMinutes,
} from "@/stores/countdown-timer/store.ts";
import { convertMinutesToSeconds } from "@/utils/conversion";

const useFocusRing = () => {
  const startTimeInMinutes = useStartTimeInMinutes();
  const remainingTimeInSeconds = useRemainingTimeInSeconds();

  const CENTER = 172;

  const totalTimeInSeconds = convertMinutesToSeconds(startTimeInMinutes);
  const elapsed = Math.max(0, totalTimeInSeconds - remainingTimeInSeconds);
  const rawProgress = totalTimeInSeconds > 0 ? elapsed / totalTimeInSeconds : 0;

  const progress = Math.min(Math.max(rawProgress, 0), 1); // 0 → 1

  const radius = 150;
  const circumference = 2 * Math.PI * radius;

  // Ring empties as time passes
  const dashoffset = circumference * progress;

  // Angle in degrees, negative for counter-clockwise (since you rotated the SVG -90deg)
  const angleDeg = -360 * progress;

  return { radius, dashoffset, circumference, angleDeg, CENTER };
};

export default useFocusRing;
