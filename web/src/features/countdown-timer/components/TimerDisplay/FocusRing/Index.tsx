import BackgroundTrack from "@/features/countdown-timer/components/TimerDisplay/FocusRing/BackgroundTrack";
import ColouredArc from "@/features/countdown-timer/components/TimerDisplay/FocusRing/ColouredArc";
import EndDot from "@/features/countdown-timer/components/TimerDisplay/FocusRing/EndDot";
import {
  useTimerPaused,
  useTimerRunning,
} from "@/features/countdown-timer/stores/countdown-store";

const FocusRing = () => {
  const timerRunning = useTimerRunning();
  const timerPaused = useTimerPaused();
  const isPulsing = timerRunning && !timerPaused;

  return (
    <svg
      className="focus-ring pointer-events-none absolute inset-0 size-full rotate-270 overflow-hidden rounded-full"
      viewBox="0 0 344 344"
    >
      <BackgroundTrack />
      <ColouredArc isPulsing={isPulsing} />
      <EndDot isPulsing={isPulsing} />
    </svg>
  );
};

export default FocusRing;
