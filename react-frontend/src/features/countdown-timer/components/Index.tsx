import ButtonControls from "@/features/countdown-timer/components/ButtonControls/Index";
import CountdownHeader from "@/features/countdown-timer/components/SessionDisplay/Index";
import CountdownDisplay from "@/features/countdown-timer/components/TimerDisplay/Index";

const CountdownTimerContainer = () => {
  return (
    <section
      className={
        "flex w-150 flex-col items-center justify-center gap-4 rounded-xl p-4"
      }
    >
      <CountdownHeader />
      <CountdownDisplay />
      <ButtonControls />
    </section>
  );
};

export default CountdownTimerContainer;
