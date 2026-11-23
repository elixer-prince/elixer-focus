import type { Song } from "@/features/music-player/types/song";

/**
 * Default playlist songs shown when the user has not added custom songs.
 * These are well-known, long-running YouTube streams suitable for focus.
 */
export const defaultSongs: Song[] = [
  {
    id: 1,
    title: "Calming White Noise",
    src: "https://www.youtube.com/watch?v=yLOM8R6lbzg",
    isRecommended: true,
  },
  {
    id: 2,
    title: "90's Chill Lofi Playlist",
    src: "https://www.youtube.com/watch?v=sF80I-TQiW0",
    isRecommended: true,
  },
  {
    id: 3,
    title: "Lofi Radio (Lofi Girl)",
    src: "https://www.youtube.com/watch?v=jfKfPfyJRdk",
    isRecommended: true,
  },
  {
    id: 4,
    title: "Chillstep Music for Programming",
    src: "https://www.youtube.com/watch?v=M5QY2_8704o",
    isRecommended: false,
  },
];
