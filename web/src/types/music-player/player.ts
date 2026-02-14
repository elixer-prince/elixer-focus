import type { RefObject } from "react";

export type YTPlayer = {
  playVideo: () => void;
  pauseVideo: () => void;
  seekTo: (seconds: number) => void;
  setVolume: (volume: number) => void;
};

export type YTPlayerEvent = {
  target: YTPlayer;
};

export type YTPlayerRef = RefObject<YTPlayer | null>;
