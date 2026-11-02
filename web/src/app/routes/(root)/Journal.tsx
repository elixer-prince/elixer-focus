import { useTimerRunning } from "@/features/countdown-timer/stores/countdown-store";
import usePageTitle from "@/hooks/usePageTitle";

const JournalRoute = () => {
  const { updatePageTitle } = usePageTitle();
  const timerRunning = useTimerRunning();

  if (!timerRunning) updatePageTitle("Elixer Focus - Journal");

  return <>{/*<p>My Journal</p>*/}</>;
};

export default JournalRoute;
