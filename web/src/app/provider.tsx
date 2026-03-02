import CountdownProvider from "@/app/providers/Countdown";
import MusicProvider from "@/app/providers/Music";
import useCountdownTimer from "@/features/countdown-timer/hooks/useCountdownTimer";
import { useDate } from "@/hooks/useDate";
import type { PropsWithChildren } from "react";

const GlobalHooks = () => {
  useDate();
  useCountdownTimer();

  return null;
};

const Provider = ({ children }: PropsWithChildren) => {
  return (
    <CountdownProvider>
      <MusicProvider>
        <GlobalHooks />
        {children}
      </MusicProvider>
    </CountdownProvider>
  );
};

export default Provider;
