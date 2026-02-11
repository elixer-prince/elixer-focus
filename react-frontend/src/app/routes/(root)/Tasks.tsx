import usePageTitle from "@/hooks/usePageTitle";
import { useTimerRunning } from "@/stores/countdown-timer/CountdownStore";

const Tasks = () => {
  const { updatePageTitle } = usePageTitle();
  const timerRunning = useTimerRunning();

  if (!timerRunning) updatePageTitle("Elixer Focus - Tasks");

  return <>{/*<p>tasks Page...</p>*/}</>;
};

export default Tasks;
