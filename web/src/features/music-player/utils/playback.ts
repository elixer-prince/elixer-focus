import type { YTPlayer } from "@/features/music-player/types/player";
import type { RefObject } from "react";

export const playVideo = (playerRef: RefObject<YTPlayer | null>): void => {
  const player = playerRef.current;

  if (!player) {
    return console.warn("YouTube player not available");
  }

  try {
    player.playVideo();
  } catch (error) {
    console.error(`Failed to play video: ${error}`);
  }
};

export const pauseVideo = (playerRef: RefObject<YTPlayer | null>): void => {
  const player = playerRef.current;

  if (!player) {
    return console.warn("YouTube player not available");
  }

  try {
    player.pauseVideo();
  } catch (error) {
    console.error(`Failed to pause video: ${error}`);
  }
};
