import useHandleCountdownState from "@/features/countdown-timer/hooks/useHandleCountdownState";
import { useRemainingTimeInSeconds } from "@/stores/countdown-timer/CountdownStore.ts";
import { formatTimeInMinutesAndSeconds } from "@/utils/formatting";

const CountdownMinutesAndSeconds = () => {
  const remainingTimeInSeconds = useRemainingTimeInSeconds();
  const { isEndingSoon } = useHandleCountdownState();

  return (
    <div
      className={`${
        isEndingSoon ? "text-error animate-pulse" : ""
      } pointer-events-none z-10 text-7xl transition-colors duration-500`.trim()}
    >
      {formatTimeInMinutesAndSeconds(remainingTimeInSeconds)}
    </div>
  );
};

export default CountdownMinutesAndSeconds;
