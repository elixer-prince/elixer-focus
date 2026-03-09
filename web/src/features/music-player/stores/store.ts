import type { Song } from "@/features/music-player/types/song";
import type { MusicPlayerStore } from "@/features/music-player/types/store";
import { create } from "zustand";
import { persist } from "zustand/middleware";

const defaultSongs = [
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

export const useMusicPlayerStore = create<MusicPlayerStore>()(
  persist(
    (set) => ({
      chosenSongId: defaultSongs[0].id,
      musicPaused: true,
      showVolumeSlider: false,
      songs: defaultSongs,
      volume: 50,

      setChosenSongId: (id: number) =>
        set(() => {
          const songExists = defaultSongs.some((song) => song.id === id);
          if (!songExists) {
            throw new Error(`A song with id ${id} was not found`);
          }
          return { chosenSongId: id };
        }),

      setMusicPaused: (paused: boolean) => set(() => ({ musicPaused: paused })),

      setShowVolumeSlider: (show: boolean) =>
        set(() => ({ showVolumeSlider: show })),

      setSongs: (songs: Song[]) => set(() => ({ songs })),

      setVolume: (volume: number) =>
        set(() => {
          return { volume: Math.min(100, Math.max(0, volume)) };
        }),
    }),
    {
      name: "music-player-storage",
    },
  ),
);

// States

export const useChosenSongId = () =>
  useMusicPlayerStore((state) => state.chosenSongId);

export const useMusicPaused = () =>
  useMusicPlayerStore((state) => state.musicPaused);

export const useShowVolumeSlider = () =>
  useMusicPlayerStore((state) => state.showVolumeSlider);

export const useSongs = () => useMusicPlayerStore((state) => state.songs);

export const useVolume = () => useMusicPlayerStore((state) => state.volume);

// Actions

export const useSetChosenSongId = () =>
  useMusicPlayerStore((state) => state.setChosenSongId);

export const useSetPlaybackPaused = () =>
  useMusicPlayerStore((state) => state.setMusicPaused);

export const useSetShowVolumeSlider = () =>
  useMusicPlayerStore((state) => state.setShowVolumeSlider);

export const useSetSongs = () => useMusicPlayerStore((state) => state.setSongs);

export const useSetVolume = () =>
  useMusicPlayerStore((state) => state.setVolume);
