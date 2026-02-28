import type { YTPlayer } from "@/types/music-player/player";
import type { RefObject } from "react";

export type MusicPlayerContextType = {
  playerRef: RefObject<HTMLDivElement | null>;
  playerInstanceRef: RefObject<YTPlayer | null>;
};
