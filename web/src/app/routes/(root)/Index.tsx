import CountdownTimerContainer from "@/features/countdown-timer/components/Index";
import { useTimerRunning } from "@/features/countdown-timer/stores/countdown-store";
import Column from "@/features/tasks/components/Column/Index";
import { useTasks } from "@/features/tasks/stores/tasks-store";
import type { Task, TaskCategory } from "@/features/tasks/types/task";
import usePageTitle from "@/hooks/usePageTitle";

const CATEGORY_PRIORITY: TaskCategory[] = [
  "urgent-important",
  "not-urgent-important",
  "urgent-not-important",
  "not-urgent-not-important",
  "uncategorised",
];

function getActiveCategory(tasks: Task[]) {
  for (const category of CATEGORY_PRIORITY) {
    if (tasks.some((task) => task.category === category)) {
      return category;
    }
  }
  return "uncategorised";
}

const Home = () => {
  const { updatePageTitle } = usePageTitle();

  const timerRunning = useTimerRunning();

  const tasks = useTasks();
  const activeCategory = getActiveCategory(tasks);

  if (!timerRunning) updatePageTitle("Elixer Focus - Home");

  return (
    <div
      id="main-wrapper"
      className="flex flex-col items-center justify-center gap-8 p-8"
    >
      <CountdownTimerContainer />

      <Column title="Current" category={activeCategory} inputPlaceholder="" />
    </div>
  );
};

export default Home;
