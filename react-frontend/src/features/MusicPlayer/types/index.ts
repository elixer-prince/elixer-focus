import type { RefObject } from "react";

export type MusicPlayerContextType = {
  chosenSongId: number;
  setChosenSongId: (value: number) => void;
  showSlider: boolean;
  setShowSlider: (value: boolean) => void;

  playerRef: RefObject<HTMLDivElement | null>;
  playerInstanceRef: RefObject<any>;
};
