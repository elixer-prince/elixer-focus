import ButtonControls from "@/features/CountdownTimer/components/ButtonControls/Index";
import CountdownHeader from "@/features/CountdownTimer/components/SessionDisplay/Index";
import CountdownDisplay from "@/features/CountdownTimer/components/TimerDisplay/Index";
import { CountdownTimerProvider } from "@/features/CountdownTimer/stores/CountdownTimerContext";

const CountdownTimerContainer = () => {
  return (
    <CountdownTimerProvider>
      {/* Countdown Timer Section */}
      <section
        className={
          "flex w-150 flex-col items-center justify-center gap-4 rounded-xl p-4"
        }
      >
        <CountdownHeader />
        <CountdownDisplay />
        <ButtonControls />
      </section>
    </CountdownTimerProvider>
  );
};

export default CountdownTimerContainer;
