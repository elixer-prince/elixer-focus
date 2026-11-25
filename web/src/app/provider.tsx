import CountdownProvider from "@/app/providers/Countdown";
import TimerCoordinatorWarning from "@/features/countdown-timer/components/TimerCoordinatorWarning";
import MusicPlayer from "@/features/music-player/components/Index";
import MusicProvider from "@/app/providers/Music";
import useAutoSyncTimer from "@/features/countdown-timer/hooks/useAutoSyncTimer";
import useCountdownTimer from "@/features/countdown-timer/hooks/useCountdownTimer";
import { useTimerCoordinatorStatus } from "@/features/countdown-timer/hooks/useTimerCoordinator";
import useAppTheme from "@/hooks/useAppTheme";
import { useDate } from "@/hooks/useDate";
import { useLayoutEffect, type PropsWithChildren } from "react";

const GlobalHooks = () => {
  const coordinator = useTimerCoordinatorStatus();
  useDate();
  useCountdownTimer();
  useAutoSyncTimer();
  useAppTheme();

  useLayoutEffect(() => {
    if (!coordinator.ready) return;
    document.body.classList.add("app-ready");
  }, [coordinator.ready]);

  return null;
};

const Provider = ({ children }: PropsWithChildren) => {
  return (
    <CountdownProvider>
      <MusicProvider>
        <GlobalHooks />
        {children}
        <TimerCoordinatorWarning />
        <MusicPlayer />
      </MusicProvider>
    </CountdownProvider>
  );
};

export default Provider;
