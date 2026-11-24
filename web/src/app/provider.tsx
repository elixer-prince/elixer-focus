import CountdownProvider from "@/app/providers/Countdown";
import MusicPlayer from "@/features/music-player/components/Index";
import MusicProvider from "@/app/providers/Music";
import useAutoSyncTimer from "@/features/countdown-timer/hooks/useAutoSyncTimer";
import useCountdownTimer from "@/features/countdown-timer/hooks/useCountdownTimer";
import useAppTheme from "@/hooks/useAppTheme";
import { useDate } from "@/hooks/useDate";
import { useLayoutEffect, type PropsWithChildren } from "react";

const GlobalHooks = () => {
  useDate();
  useCountdownTimer();
  useAutoSyncTimer();
  useAppTheme();

  useLayoutEffect(() => {
    document.body.classList.add("app-ready");
  }, []);

  return null;
};

const Provider = ({ children }: PropsWithChildren) => {
  return (
    <CountdownProvider>
      <MusicProvider>
        <GlobalHooks />
        {children}
        <MusicPlayer />
      </MusicProvider>
    </CountdownProvider>
  );
};

export default Provider;
