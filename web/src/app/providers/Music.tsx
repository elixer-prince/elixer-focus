import MusicPlayerContext from "@/features/music-player/contexts/Context";
import type { MusicPlayerContextType } from "@/features/music-player/types/context";
import type { YTPlayer } from "@/features/music-player/types/player";
import { useMemo, useRef, type PropsWithChildren } from "react";

const MusicProvider = ({ children }: PropsWithChildren) => {
  const playerRef = useRef<HTMLDivElement | null>(null);
  const playerInstanceRef = useRef<YTPlayer | null>(null);
  const isControllingPlayerRef = useRef(false);
  const lastLoadedVideoIdRef = useRef<string | null>(null);

  const contextValues: MusicPlayerContextType = useMemo(
    () => ({ playerRef, playerInstanceRef, isControllingPlayerRef, lastLoadedVideoIdRef }),
    [],
  );

  return (
    <MusicPlayerContext.Provider value={contextValues}>
      {children}
    </MusicPlayerContext.Provider>
  );
};

export default MusicProvider;
