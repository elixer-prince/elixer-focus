import usePageTitle from "@/hooks/usePageTitle";
import { useTimerRunning } from "@/stores/countdown-timer/countdown-store";

const Tasks = () => {
  const { updatePageTitle } = usePageTitle();
  const timerRunning = useTimerRunning();

  if (!timerRunning) updatePageTitle("Elixer Focus - Tasks");

  return <>{/*<p>tasks Page...</p>*/}</>;
};

export default Tasks;
