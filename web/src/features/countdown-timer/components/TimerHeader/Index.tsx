import CurrentSessionType from "@/features/countdown-timer/components/TimerHeader/CurrentSessionType";
import SessionSwitcher from "@/features/countdown-timer/components/TimerHeader/SessionSwitcher/Index";

const CountdownTimerHeader = () => {
  return (
    <header className="timer-header flex flex-col items-center justify-center gap-4 select-none">
      <CurrentSessionType />
      <SessionSwitcher />
    </header>
  );
};

export default CountdownTimerHeader;
