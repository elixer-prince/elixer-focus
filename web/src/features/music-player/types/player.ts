import type { RefObject } from "react";

export interface YTPlayer {
  loadVideoById: (
    videoId: string | { videoId: string; startSeconds?: number },
  ) => void;
  cueVideoById: (
    videoId: string | { videoId: string; startSeconds?: number },
  ) => void;
  playVideo: () => void;
  pauseVideo: () => void;
  stopVideo: () => void;
  mute: () => void;
  unMute: () => void;
  isMuted: () => boolean;
  setVolume: (volume: number) => void;
  getVolume: () => number;
  getPlayerState: () => number;
  // Add any other methods you use
}

export type YTPlayerEvent = {
  target: YTPlayer;
};

export type YTPlayerRef = RefObject<YTPlayer | null>;
