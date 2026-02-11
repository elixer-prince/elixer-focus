import usePageTitle from "@/hooks/usePageTitle";
import { useTimerRunning } from "@/stores/countdown-timer/CountdownStore";

const Journal = () => {
  const { updatePageTitle } = usePageTitle();
  const timerRunning = useTimerRunning();

  if (!timerRunning) updatePageTitle("Elixer Focus - Journal");

  return <>{/*<p>My Journal</p>*/}</>;
};

export default Journal;
