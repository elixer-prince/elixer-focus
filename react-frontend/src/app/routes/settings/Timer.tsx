import TimerSettings from "@/features/settings/timer/Index";
import CountdownProvider from "@/components/providers/CountdownProvider.tsx";

const Timer = () => {
  return (
    <CountdownProvider>
      <TimerSettings />
    </CountdownProvider>
  );
};

export default Timer;
