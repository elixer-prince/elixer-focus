import type { YTPlayer } from "@/types/music-player/player";
import type { RefObject } from "react";

export const playVideo = (playerRef: RefObject<YTPlayer | null>): void => {
  // Access the actual player via .current
  const player = playerRef.current;

  if (!player) {
    console.warn("YouTube player not available");
    return;
  }

  try {
    player.playVideo();
  } catch (error) {
    console.error("Failed to play video:", error);
  }
};

export const pauseVideo = (playerRef: RefObject<YTPlayer | null>): void => {
  const player = playerRef.current;

  if (!player) {
    console.warn("YouTube player not available");
    return;
  }

  try {
    player.pauseVideo();
  } catch (error) {
    console.error("Failed to pause video:", error);
  }
};
