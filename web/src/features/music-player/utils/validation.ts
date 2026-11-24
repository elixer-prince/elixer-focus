/**
 * Check whether a YouTube video ID corresponds to an existing, playable video.
 * Uses the YouTube oEmbed API which returns 404 for invalid or private videos.
 */
export async function isValidYouTubeVideo(videoId: string): Promise<boolean> {
  try {
    const response = await fetch(
      `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${encodeURIComponent(videoId)}&format=json`,
    );
    return response.ok;
  } catch {
    return false;
  }
}
