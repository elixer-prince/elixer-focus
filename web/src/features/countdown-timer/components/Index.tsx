import ButtonControls from "@/features/countdown-timer/components/ButtonControls/Index";
import CountdownDisplay from "@/features/countdown-timer/components/TimerDisplay/Index";
import CountdownHeader from "@/features/countdown-timer/components/TimerHeader/Index";

const CountdownTimerContainer = () => {
  return (
    <section className="timer-container flex w-150 flex-col items-center justify-center gap-4 rounded-xl p-8">
      <CountdownHeader />
      <CountdownDisplay />
      <ButtonControls />
    </section>
  );
};

export default CountdownTimerContainer;
