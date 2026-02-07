/**
 * Plays the YouTube video using the IFrame API.
 *
 * @param {any} player - The YouTube API player instance. If falsy, the function does nothing.
 * @returns {void}
 */
export const playVideo = (player: any): void => {
  if (!player) return;
  player.playVideo();
};

/**
 * Pauses the YouTube video using the IFrame API.
 *
 * @param {any} player - The YouTube API player instance. If falsy, the function does nothing.
 * @returns {void}
 */
export const pauseVideo = (player: any): void => {
  if (!player) return;
  player.pauseVideo();
};
