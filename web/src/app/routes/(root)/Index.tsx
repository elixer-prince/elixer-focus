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

      <div className="flex gap-8 border border-red-500">
        <Column title="Test Task Sorting..." category="uncategorised" />
        <Column title="To-Do (In Progress)" category="urgent-important" />
      </div>
    </div>
  );
};

export default Home;
