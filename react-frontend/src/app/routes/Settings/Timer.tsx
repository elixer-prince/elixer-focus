import TimerSettings from "@/features/countdown-timer/components/TimerSettings/Index";
import { CountdownTimerProvider } from "@/stores/countdown-timer/CountdownContext.tsx";

const Timer = () => {
  return (
    <CountdownTimerProvider>
      <TimerSettings />
    </CountdownTimerProvider>
  );
};

export default Timer;
