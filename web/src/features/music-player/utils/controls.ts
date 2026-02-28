import type { YTPlayerEvent } from "@/types/music-player/player";

export const onPlayerReady = (
  event: YTPlayerEvent,
  playbackPaused: boolean,
): void => {
  // Do something after the player is ready
};

// TODO: export const onPlayerStateChange = (event: any) => {
//     if (event.data === window.YT.PlayerState.ENDED) {
//     }
// };
