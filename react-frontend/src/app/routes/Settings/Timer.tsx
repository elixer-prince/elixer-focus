import TimerSettings from "@/features/CountdownTimer/components/TimerSettings/Index";
import { CountdownTimerProvider } from "@/features/CountdownTimer/stores/CountdownTimerContext";

const Timer = () => {
  return (
    <CountdownTimerProvider>
      <TimerSettings />
    </CountdownTimerProvider>
  );
};

export default Timer;
