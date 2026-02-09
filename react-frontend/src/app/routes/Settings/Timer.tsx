import TimerSettings from "@/features/countdown-timer/components/TimerSettings/Index";
import CountdownProvider from "@/components/providers/CountdownProvider.tsx";

const Timer = () => {
  return (
    <CountdownProvider>
      <TimerSettings />
    </CountdownProvider>
  );
};

export default Timer;
