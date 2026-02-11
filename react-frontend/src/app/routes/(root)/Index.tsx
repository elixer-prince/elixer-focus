import CountdownTimerContainer from "@/features/countdown-timer/components/Index";
import usePageTitle from "@/hooks/usePageTitle";
import { useTimerRunning } from "@/stores/countdown-timer/CountdownStore";

const Home = () => {
  const { updatePageTitle } = usePageTitle();
  const timerRunning = useTimerRunning();

  if (!timerRunning) updatePageTitle("Elixer Focus - Home");

  return (
    <div className={"flex justify-center gap-8"}>
      <CountdownTimerContainer />
    </div>
  );
};

export default Home;
