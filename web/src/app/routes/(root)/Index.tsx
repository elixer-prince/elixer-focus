import CountdownTimerContainer from "@/features/countdown-timer/components/Index";
import Column from "@/features/tasks/components/Column";
import usePageTitle from "@/hooks/usePageTitle";
import { useTimerRunning } from "@/features/countdown-timer/stores/countdown-store";

const Home = () => {
  const { updatePageTitle } = usePageTitle();
  const timerRunning = useTimerRunning();

  if (!timerRunning) updatePageTitle("Elixer Focus - Home");

  return (
    <div className="flex flex-wrap justify-center gap-8 p-8">
      <CountdownTimerContainer />

      <Column title="To-Do (In Progress)" category="urgent-important" />
    </div>
  );
};

export default Home;
