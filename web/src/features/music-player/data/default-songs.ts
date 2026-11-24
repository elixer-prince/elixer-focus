import type { Song } from "@/features/music-player/types/song";

/**
 * Default playlist songs shown when the user has not added custom songs.
 * These are well-known, long-running YouTube streams suitable for focus.
 */
export const defaultSongs: Song[] = [
  {
    id: "yLOM8R6lbzg",
    title: "Calming White Noise",
    src: "https://www.youtube.com/watch?v=yLOM8R6lbzg",
    isRecommended: true,
  },
  {
    id: "sF80I-TQiW0",
    title: "90's Chill Lofi Playlist",
    src: "https://www.youtube.com/watch?v=sF80I-TQiW0",
    isRecommended: true,
  },
  {
    id: "CFGLoQIhmow",
    title: "Lofi Radio (Lofi Girl)",
    src: "https://www.youtube.com/watch?v=CFGLoQIhmow",
    isRecommended: true,
  },
  {
    id: "2ojMshIhLmw",
    title: "Linkin Park Lofi Mix",
    src: "https://www.youtube.com/watch?v=2ojMshIhLmw",
    isRecommended: true,
  },
  {
    id: "ihe1QbeGt7U",
    title: "Linkin Park Lofi Mix VOL 2",
    src: "https://www.youtube.com/watch?v=ihe1QbeGt7U",
    isRecommended: true,
  },
  {
    id: "M5QY2_8704o",
    title: "Chillstep Music for Programming",
    src: "https://www.youtube.com/watch?v=M5QY2_8704o",
    isRecommended: false,
  },
];
