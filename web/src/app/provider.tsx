import CountdownProvider from "@/app/providers/Countdown";
import MusicProvider from "@/app/providers/Music";
import type { PropsWithChildren } from "react";

const Provider = ({ children }: PropsWithChildren) => {
  return (
    <CountdownProvider>
      <MusicProvider>{children}</MusicProvider>
    </CountdownProvider>
  );
};

export default Provider;
