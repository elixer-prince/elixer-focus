/**
 * Extracts the YouTube video ID from a standard YouTube URL.
 *
 * @param {string} url - The original, full YouTube URL (e.g., https://www.youtube.com/watch?v=VIDEO_ID).
 * @returns {string} The video ID if found; otherwise, returns the original URL.
 */
export const getVideoId = (url: string): string => {
    const match = url.match(/[?&]v=([^&#]*)/);
    return match ? match[1] : url;
};
