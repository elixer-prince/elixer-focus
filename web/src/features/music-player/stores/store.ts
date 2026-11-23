import type { Song } from "@/features/music-player/types/song";
import type {
  MusicPlayerState,
  MusicPlayerStore,
} from "@/features/music-player/types/store";
import { defaultSongs } from "@/features/music-player/data/default-songs";
import { create } from "zustand";
import { createPersistOptions, persist } from "@/stores/persist-config";

export const useMusicPlayerStore = create<MusicPlayerStore>()(
  persist(
    (set) => ({
      chosenSongId: defaultSongs[0].id,
      musicPaused: true,
      showVolumeSlider: false,
      songs: defaultSongs,
      volume: 50,

      setChosenSongId: (id: number) =>
        set((state) => {
          const songExists = state.songs.some((song) => song.id === id);
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
    createPersistOptions<MusicPlayerStore>({
      name: "music-player-storage",
      version: 4,
      migrate: (state, version) => {
        const persistedState = state as Partial<MusicPlayerState>;
        // Clear musicPaused from old stored states so player always starts paused
        if (version < 4) {
          delete persistedState.musicPaused;
          delete persistedState.showVolumeSlider;
        }
        return persistedState as MusicPlayerStore;
      },
      // Exclude musicPaused and showVolumeSlider from persistence so they
      // always use their defaults on page load: music starts paused and the
      // volume slider starts closed
      partialize: (state) => {
        const rest = { ...state };
        delete rest.musicPaused;
        delete rest.showVolumeSlider;
        return rest;
      },
    }),
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

export const useSetMusicPaused = () =>
  useMusicPlayerStore((state) => state.setMusicPaused);

export const useSetShowVolumeSlider = () =>
  useMusicPlayerStore((state) => state.setShowVolumeSlider);

export const useSetSongs = () => useMusicPlayerStore((state) => state.setSongs);

export const useSetVolume = () =>
  useMusicPlayerStore((state) => state.setVolume);
