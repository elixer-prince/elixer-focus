import TimerSettings from "@/features/countdown-timer/components/TimerSettings/Index";
import { CountdownTimerProvider } from "@/stores/CountdownTimerContext";

const Timer = () => {
  return (
    <CountdownTimerProvider>
      <TimerSettings />
    </CountdownTimerProvider>
  );
};

export default Timer;
