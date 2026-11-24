import type { YTPlayer } from "@/features/music-player/types/player";
import type { RefObject } from "react";

export const playVideo = (playerRef: RefObject<YTPlayer | null>): void => {
  const player = playerRef.current;

  if (!player) {
    return;
  }

  try {
    player.playVideo();
  } catch {
    // Failed to play video
  }
};

export const pauseVideo = (playerRef: RefObject<YTPlayer | null>): void => {
  const player = playerRef.current;

  if (!player) {
    return;
  }

  try {
    player.pauseVideo();
  } catch {
    // Failed to pause video
  }
};
