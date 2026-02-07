import type { RefObject } from "react";

export type MusicPlayerContextType = {
  playerRef: RefObject<HTMLDivElement | null>;
  playerInstanceRef: RefObject<any>;
};
