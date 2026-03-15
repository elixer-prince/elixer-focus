import type { YTPlayer } from "@/features/music-player/types/player";
import type { RefObject } from "react";

export type MusicPlayerContextType = {
  playerRef: RefObject<HTMLDivElement | null>;
  playerInstanceRef: RefObject<YTPlayer | null>;
};
