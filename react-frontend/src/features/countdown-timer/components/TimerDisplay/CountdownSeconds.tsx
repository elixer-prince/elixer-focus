import useHandleCountdownState from "@/features/countdown-timer/components/TimerDisplay/hooks/useHandleCountdownState";
import { useRemainingTimeInSeconds } from "@/stores/CountdownTimerStore";

const CountdownSeconds = () => {
  const remainingTimeInSeconds = useRemainingTimeInSeconds();
  const { isEndingSoon } = useHandleCountdownState();

  return (
    <span
      className={`${isEndingSoon ? "text-error" : ""} pointer-events-none z-10`.trim()}
    >
      <span className={`${isEndingSoon ? "animate-pulse" : ""}`}>
        {remainingTimeInSeconds}
      </span>{" "}
      <span className="text-primary">seconds</span>
    </span>
  );
};

export default CountdownSeconds;
