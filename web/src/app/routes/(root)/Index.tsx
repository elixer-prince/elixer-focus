import CountdownTimerContainer from "@/features/countdown-timer/components/Index";
import TaskList from "@/features/tasks/components/TaskList";
import usePageTitle from "@/hooks/usePageTitle";
import { useTimerRunning } from "@/stores/countdown-timer/store";

const Home = () => {
  const { updatePageTitle } = usePageTitle();
  const timerRunning = useTimerRunning();

  if (!timerRunning) updatePageTitle("Elixer Focus - Home");

  return (
    <div className="flex justify-center gap-8 p-8">
      <CountdownTimerContainer />

      <TaskList />
    </div>
  );
};

export default Home;
