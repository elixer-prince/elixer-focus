import TimerSettings from "@/features/countdown-timer/components/TimerSettings/Index";
import { CountdownTimerProvider } from "@/contexts/CountdownTimer.tsx";

const Timer = () => {
  return (
    <CountdownTimerProvider>
      <TimerSettings />
    </CountdownTimerProvider>
  );
};

export default Timer;
