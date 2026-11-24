import useHandleCountdownState from "@/features/countdown-timer/hooks/useHandleCountdownState";
import { useRemainingTimeInSeconds } from "@/features/countdown-timer/stores/countdown-store";
import { formatTimeInMinutesAndSeconds } from "@/utils/formatting";

const CountdownMinutesAndSeconds = () => {
  const remainingTimeInSeconds = useRemainingTimeInSeconds();
  const { isEndingSoon } = useHandleCountdownState();

  const baseClasses = "z-10  text-7xl transition-colors duration-500";

  return (
    <div
      className={`${
        isEndingSoon ? "text-error animate-pulse" : ""
      } pointer-events-none ${baseClasses}`.trim()}
    >
      {formatTimeInMinutesAndSeconds(remainingTimeInSeconds)}
    </div>
  );
};

export default CountdownMinutesAndSeconds;
