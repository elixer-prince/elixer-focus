import CurrentSessionType from "@/features/countdown-timer/components/SessionDisplay/CurrentSessionType";
import SessionSwitcher from "@/features/countdown-timer/components/SessionDisplay/SessionSwitcher/Index";

const CountdownTimerHeader = () => {
  return (
    <header className={"mt-8 flex flex-col items-center justify-center gap-4"}>
      <CurrentSessionType />
      <SessionSwitcher />
    </header>
  );
};

export default CountdownTimerHeader;
