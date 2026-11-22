import ButtonControls from "@/features/countdown-timer/components/ButtonControls/Index";
import CountdownDisplay from "@/features/countdown-timer/components/TimerDisplay/Index";
import CountdownHeader from "@/features/countdown-timer/components/TimerHeader/Index";
import NotificationStatus from "@/features/countdown-timer/components/NotificationStatus";

const CountdownTimerContainer = () => {
  return (
    <section className="timer-container flex w-150 flex-col items-center justify-center gap-4 rounded-xl p-8">
      <CountdownHeader />
      <CountdownDisplay />
      <ButtonControls />
      <NotificationStatus />
    </section>
  );
};

export default CountdownTimerContainer;
