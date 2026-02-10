import type { RefObject } from "react";

export type YTPlayer = {
  playVideo: () => void;
  pauseVideo: () => void;
};

export type YTPlayerEvent = {
  target: YTPlayer;
};

export type YTPlayerRef = RefObject<YTPlayer | null>;
