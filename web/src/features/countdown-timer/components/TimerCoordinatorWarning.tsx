import { useTimerCoordinatorStatus } from "@/features/countdown-timer/hooks/useTimerCoordinator";

const TimerCoordinatorWarning = () => {
  const { ready, supported } = useTimerCoordinatorStatus();

  if (!ready || supported) return null;

  return (
    <div
      className="alert alert-warning fixed right-4 bottom-4 z-50 max-w-sm text-sm shadow-lg"
      role="status"
    >
      Cross tab timer control is unavailable in this browser. Use Elixer Focus
      in one tab at a time.
    </div>
  );
};

export default TimerCoordinatorWarning;
