import useHandleCountdownState from "@/features/CountdownTimer/components/TimerDisplay/hooks/useHandleCountdownState";
import { useRemainingTimeInSeconds } from "@/features/CountdownTimer/stores/CountdownTimerStore";
import { formatTimeInMinutesAndSeconds } from "@/utils/formatting";

const CountdownMinutesAndSeconds = () => {
  const { isEndingSoon } = useHandleCountdownState();
  const remainingTimeInSeconds = useRemainingTimeInSeconds();

  return (
    <div
      className={`pointer-events-none z-10 text-7xl transition-colors duration-500 ${
        isEndingSoon ? "text-error" : ""
      }`}
    >
      {formatTimeInMinutesAndSeconds(remainingTimeInSeconds)}
    </div>
  );
};

export default CountdownMinutesAndSeconds;
