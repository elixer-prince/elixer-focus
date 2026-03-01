import MusicPlayerContext from "@/features/music-player/contexts/Context";
import type { MusicPlayerContextType } from "@/features/music-player/types/context";
import type { YTPlayer } from "@/types/music-player/player";
import { useMemo, useRef, type PropsWithChildren } from "react";

const MusicProvider = ({ children }: PropsWithChildren) => {
  const playerRef = useRef<HTMLDivElement | null>(null);
  const playerInstanceRef = useRef<YTPlayer | null>(null);

  const contextValues: MusicPlayerContextType = useMemo(
    () => ({ playerRef, playerInstanceRef }),
    [],
  );

  return (
    <MusicPlayerContext.Provider value={contextValues}>
      {children}
    </MusicPlayerContext.Provider>
  );
};

export default MusicProvider;
