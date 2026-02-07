import type { RefObject } from "react";

export type MusicPlayerContextType = {
  showSlider: boolean;
  setShowSlider: (value: boolean) => void;

  playerRef: RefObject<HTMLDivElement | null>;
  playerInstanceRef: RefObject<any>;
};
