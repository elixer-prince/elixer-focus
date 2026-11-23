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

      setChosenSongId: (id: string) =>
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

      addSong: (url: string, title?: string) =>
        set((state) => {
          const videoId = url.match(/[?&]v=([^&#]*)/)?.[1];
          if (!videoId) {
            return state;
          }
          // Don't add duplicate
          if (state.songs.some((song) => song.id === videoId)) {
            return state;
          }
          const trimmedTitle = title?.trim();
          const newSong: Song = {
            id: videoId,
            title: trimmedTitle || `Custom song`,
            src: `https://www.youtube.com/watch?v=${videoId}`,
            isRecommended: false,
            isCustom: true,
          };
          return { songs: [...state.songs, newSong] };
        }),

      removeSong: (id: string) =>
        set((state) => {
          const song = state.songs.find((s) => s.id === id);
          // Only allow removing custom songs
          if (!song?.isCustom) {
            return state;
          }
          const newSongs = state.songs.filter((s) => s.id !== id);
          // If the removed song was the chosen one, switch to the first available
          if (state.chosenSongId === id) {
            return {
              songs: newSongs,
              chosenSongId: newSongs[0]?.id ?? "",
            };
          }
          return { songs: newSongs };
        }),
    }),
    createPersistOptions<MusicPlayerStore>({
      name: "music-player-storage",
      version: 5,
      migrate: (state, version) => {
        const persistedState = state as Partial<MusicPlayerState>;
        // Clear musicPaused from old stored states so player always starts paused
        if (version < 4) {
          delete persistedState.musicPaused;
          delete persistedState.showVolumeSlider;
        }
        // Migrate numeric IDs to string (video ID) for v5
        if (version < 5 && persistedState.songs) {
          const migratedSongs = (persistedState.songs as any[]).map((song) => ({
            ...song,
            id: String(song.id),
          }));
          persistedState.songs = migratedSongs as any;
          if (persistedState.chosenSongId != null) {
            persistedState.chosenSongId = String(persistedState.chosenSongId);
          }
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

export const useAddSong = () => useMusicPlayerStore((state) => state.addSong);

export const useRemoveSong = () =>
  useMusicPlayerStore((state) => state.removeSong);
