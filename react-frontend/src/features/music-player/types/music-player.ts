import type { RefObject } from "react";
import type { YTPlayer } from "@/types/music-player/player.ts";

export type MusicPlayerContextType = {
  playerRef: RefObject<HTMLDivElement | null>;
  playerInstanceRef: RefObject<YTPlayer | null>;
};
