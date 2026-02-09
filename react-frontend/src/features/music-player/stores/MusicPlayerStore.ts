import type { Song } from "@/features/music-player/types/song";
import { create } from "zustand";

const defaultSongs = [
  {
    id: 1,
    title: "Calming White Noise",
    src: "https://www.youtube.com/watch?v=yLOM8R6lbzg",
    isRecommended: true,
  },
  {
    id: 2,
    title: "Lofi Radio (Lofi Girl)",
    src: "https://www.youtube.com/watch?v=jfKfPfyJRdk",
    isRecommended: true,
  },
  {
    id: 3,
    title: "90's Chill Lofi Playlist",
    src: "https://www.youtube.com/watch?v=sF80I-TQiW0",
    isRecommended: false,
  },
  {
    id: 4,
    title: "Chillstep Music for Programming / Cyber / Coding",
    src: "https://www.youtube.com/watch?v=M5QY2_8704o",
    isRecommended: false,
  },
];

type MusicPlayerState = {
  playbackPaused: boolean;
  showSlider: boolean;
  volume: number;
  chosenSongId: number;
  songs: Song[];
};

type MusicPlayerActions = {
  setPlaybackPaused: (paused: boolean) => void;
  setShowSlider: (show: boolean) => void;
  setVolume: (volume: number) => void;
  setChosenSongId: (id: number) => void;
  setSongs: (songs: Song[]) => void;
};

type MusicPlayerStore = MusicPlayerState & MusicPlayerActions;

/*--------------------------------------------------
| NAVBAR STORE
|---------------------------------------------------
|
*/

const useMusicPlayerStore = create<MusicPlayerStore>((set) => ({
  playbackPaused: false,
  showSlider: false,
  volume: 50,
  chosenSongId: defaultSongs[0].id,
  songs: defaultSongs,

  setPlaybackPaused: (paused: boolean) =>
    set(() => ({ playbackPaused: paused })),

  setShowSlider: (show: boolean) => set(() => ({ showSlider: show })),

  setVolume: (volume: number) => set(() => ({ volume })),

  setChosenSongId: (id: number) => set(() => ({ chosenSongId: id })),

  setSongs: (songs: Song[]) => set(() => ({ songs })),
}));

/*--------------------------------------------------
| NAVBAR EXPORTS
|---------------------------------------------------
|
*/

// STATES

export const usePlaybackPaused = () =>
  useMusicPlayerStore((state) => state.playbackPaused);

export const useShowSlider = () =>
  useMusicPlayerStore((state) => state.showSlider);

export const useVolume = () => useMusicPlayerStore((state) => state.volume);

export const useSongs = () => useMusicPlayerStore((state) => state.songs);

export const useChosenSongId = () =>
  useMusicPlayerStore((state) => state.chosenSongId);

// ACTIONS

export const useSetPlaybackPaused = () =>
  useMusicPlayerStore((state) => state.setPlaybackPaused);

export const useSetShowSlider = () =>
  useMusicPlayerStore((state) => state.setShowSlider);

export const useSetVolume = () =>
  useMusicPlayerStore((state) => state.setVolume);

export const useSetSongs = () => useMusicPlayerStore((state) => state.setSongs);

export const useSetChosenSongId = () =>
  useMusicPlayerStore((state) => state.setChosenSongId);
