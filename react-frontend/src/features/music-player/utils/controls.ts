import type { YTPlayerEvent } from "@/types/music-player/player.ts";

/**
 * Called when the YouTube player is ready.
 * Plays or pauses the video depending on the `playbackPaused` flag.
 *
 * @param {YTPlayerEvent} event - The event object provided by the YouTube IFrame API.
 * @param {boolean} playbackPaused - If true, the video will be paused; otherwise, it will play.
 * @returns {void}
 */
export const onPlayerReady = (
  event: YTPlayerEvent,
  playbackPaused: boolean,
): void => {
  if (playbackPaused) {
    event.target.pauseVideo();
  } else {
    event.target.playVideo();
  }
};

// export const onPlayerStateChange = (event: any) => {
//     if (event.data === window.YT.PlayerState.ENDED) {
//     }
// };
