import type { Song } from "@/types/music-player/song";
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

console.log(defaultSongs[0]);

type MusicPlayerState = {
  chosenSongId: number;
  musicPaused: boolean;
  showVolumeSlider: boolean;
  songs: Song[];
  volume: number;
};

type MusicPlayerActions = {
  setChosenSongId: (id: number) => void;
  setPlaybackPaused: (paused: boolean) => void;
  setShowVolumeSlider: (show: boolean) => void;
  setSongs: (songs: Song[]) => void;
  setVolume: (volume: number) => void;
};

type MusicPlayer = MusicPlayerState & MusicPlayerActions;

const useMusicPlayerStore = create<MusicPlayer>((set) => ({
  chosenSongId: defaultSongs[0].id,
  musicPaused: true,
  showVolumeSlider: false,
  songs: defaultSongs,
  volume: 50,

  setChosenSongId: (id: number) => set(() => ({ chosenSongId: id })),

  setPlaybackPaused: (paused: boolean) =>
    set(() => ({ musicPaused: paused })),

  setShowVolumeSlider: (show: boolean) =>
    set(() => ({ showVolumeSlider: show })),

  setSongs: (songs: Song[]) => set(() => ({ songs })),

  setVolume: (volume: number) => set(() => ({ volume })),
}));

// STATES

export const useChosenSongId = () =>
  useMusicPlayerStore((state) => state.chosenSongId);

export const useMusicPaused = () =>
  useMusicPlayerStore((state) => state.musicPaused);

export const useShowVolumeSlider = () =>
  useMusicPlayerStore((state) => state.showVolumeSlider);

export const useSongs = () => useMusicPlayerStore((state) => state.songs);

export const useVolume = () => useMusicPlayerStore((state) => state.volume);

// ACTIONS

export const useSetChosenSongId = () =>
  useMusicPlayerStore((state) => state.setChosenSongId);

export const useSetPlaybackPaused = () =>
  useMusicPlayerStore((state) => state.setPlaybackPaused);

export const useSetShowVolumeSlider = () =>
  useMusicPlayerStore((state) => state.setShowVolumeSlider);

export const useSetSongs = () => useMusicPlayerStore((state) => state.setSongs);

export const useSetVolume = () =>
  useMusicPlayerStore((state) => state.setVolume);
