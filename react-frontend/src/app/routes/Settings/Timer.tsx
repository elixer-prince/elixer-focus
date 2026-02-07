import TimerSettings from "@/features/CountdownTimer/components/TimerSettings/Index.tsx";
import { CountdownTimerProvider } from "@/features/CountdownTimer/stores/CountdownTimerContext.tsx";
import { CountdownSessionProvider } from "@/features/CountdownTimer/stores/SessionContext.tsx";

const Timer = () => {
  return (
    <CountdownSessionProvider>
      <CountdownTimerProvider>
        <TimerSettings />
      </CountdownTimerProvider>
    </CountdownSessionProvider>
  );
};

export default Timer;
