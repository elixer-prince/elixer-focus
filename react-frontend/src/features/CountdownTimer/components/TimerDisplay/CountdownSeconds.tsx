import useHandleCountdownState from "@/features/CountdownTimer/components/TimerDisplay/hooks/useHandleCountdownState";
import { useRemainingTimeInSeconds } from "@/features/CountdownTimer/stores/CountdownTimerStore";

const CountdownSeconds = () => {
  const { isEndingSoon } = useHandleCountdownState();
  const remainingTimeInSeconds = useRemainingTimeInSeconds();

  return (
    <span
      className={`pointer-events-none z-10 ${isEndingSoon ? "text-error" : ""}`.trim()}
    >
      {remainingTimeInSeconds} <span className="text-primary">seconds</span>
    </span>
  );
};

export default CountdownSeconds;
