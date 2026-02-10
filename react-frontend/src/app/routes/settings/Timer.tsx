import CountdownProvider from "@/components/providers/CountdownProvider";
import TimerSettings from "@/features/settings/timer/Index";

const Timer = () => {
  return (
    <CountdownProvider>
      <TimerSettings />
    </CountdownProvider>
  );
};

export default Timer;
