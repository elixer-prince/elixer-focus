import type { Song } from "@/features/music-player/types/song";
import type {
  MusicPlayerState,
  MusicPlayerStore,
} from "@/features/music-player/types/store";
import { defaultSongs } from "@/features/music-player/data/default-songs";
import { create } from "zustand";
import { persist } from "@/stores/persist-config";
import type { PersistStorage } from "zustand/middleware";
import { useRef } from "react";

const localStorageStorage: PersistStorage<object, unknown> = {
  getItem: (name: string) => {
    const value = localStorage.getItem(name);
    return value ? JSON.parse(value) : null;
  },
  setItem: (name: string, value: unknown) => {
    localStorage.setItem(name, JSON.stringify(value));
  },
  removeItem: (name: string) => {
    localStorage.removeItem(name);
  },
};

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
    {
      name: "music-player-storage",
      version: 10,
      storage: localStorageStorage,
      merge: (persistedState, currentState) => {
        const persisted = persistedState as Partial<MusicPlayerState>;
        let songs = persisted.songs;
        let chosenSongId = persisted.chosenSongId;
        // Deduplicate songs on every restore so duplicates can never accumulate
        if (songs) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const persistedSongs = songs as any[];
          const seen = new Set<string>();
          const uniqueSongs = persistedSongs.filter((song) => {
            if (seen.has(song.id)) {
              return false;
            }
            seen.add(song.id);
            return true;
          });
          // Remove default songs that are no longer in the codebase's default list,
          // but always keep custom songs intact.
          const defaultIds = new Set(defaultSongs.map((s) => s.id));
          const filteredSongs = uniqueSongs.filter(
            (song) => song.isCustom || defaultIds.has(song.id),
          );
          // Append any new default songs that are not yet in the persisted list,
          // so that adding defaults to the codebase simply extends the user's
          // existing playlist rather than replacing it.
          const missingDefaults = defaultSongs.filter((s) => !seen.has(s.id));
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const mergedSongs = [...filteredSongs, ...missingDefaults] as any;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          songs = mergedSongs as any;
          // Ensure chosenSongId is valid after filtering
          const mergedIds = new Set(
            mergedSongs.map((s: { id: string }) => s.id),
          );
          if (chosenSongId && !mergedIds.has(chosenSongId as string)) {
            chosenSongId = mergedSongs[0]?.id ?? currentState.chosenSongId;
          }
        }
        return {
          ...currentState,
          ...persisted,
          songs: songs ?? currentState.songs,
          chosenSongId: chosenSongId ?? currentState.chosenSongId,
        };
      },
      migrate: (state, version) => {
        const persistedState = state as Partial<MusicPlayerState>;
        // Clear musicPaused from old stored states so player always starts paused
        if (version < 4) {
          delete persistedState.musicPaused;
          delete persistedState.showVolumeSlider;
        }
        // Migrate numeric IDs to string (video ID) for v5
        if (version < 5 && persistedState.songs) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const migratedSongs = (persistedState.songs as any[]).map((song) => ({
            ...song,
            id: String(song.id),
          }));
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          persistedState.songs = migratedSongs as any;
          if (persistedState.chosenSongId != null) {
            persistedState.chosenSongId = String(persistedState.chosenSongId);
          }
        }
        // Remove defunct videos and merge missing defaults
        if (version < 7 && persistedState.songs) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const persistedSongs = persistedState.songs as any[];
          // Remove removed videos
          const withoutRemoved = persistedSongs.filter(
            (song) => song.id !== "jfKfPfyJRdk" && song.id !== "rFZHOHl-L8A",
          );
          // Add any default songs that are missing
          const persistedIds = new Set(withoutRemoved.map((s) => s.id));
          const missingDefaults = defaultSongs.filter(
            (s) => !persistedIds.has(s.id),
          );
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          persistedState.songs = [...withoutRemoved, ...missingDefaults] as any;
          // Switch chosen song if it was a removed one
          if (
            persistedState.chosenSongId === "jfKfPfyJRdk" ||
            persistedState.chosenSongId === "rFZHOHl-L8A"
          ) {
            persistedState.chosenSongId = "CFGLoQIhmow";
          }
        }
        // Deduplicate songs
        if (version < 8 && persistedState.songs) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const persistedSongs = persistedState.songs as any[];
          const seen = new Set<string>();
          const uniqueSongs = persistedSongs.filter((song) => {
            if (seen.has(song.id)) {
              return false;
            }
            seen.add(song.id);
            return true;
          });
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          persistedState.songs = uniqueSongs as any;
          if (
            persistedState.chosenSongId &&
            !seen.has(persistedState.chosenSongId as string)
          ) {
            persistedState.chosenSongId =
              uniqueSongs[0]?.id ?? defaultSongs[0].id;
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

export const useSongs = () => {
  const songs = useMusicPlayerStore((state) => state.songs);
  // Deduplicate by ID as a safety net so the UI never shows duplicates.
  // Cache the result and return the same reference when the underlying
  // songs reference has not changed, to avoid unnecessary re-renders.
  const prevSongs = useRef<Song[] | undefined>(undefined);
  const prevResult = useRef<Song[] | undefined>(undefined);
  if (songs === prevSongs.current && prevResult.current !== undefined) {
    return prevResult.current;
  }
  prevSongs.current = songs;
  const seen = new Set<string>();
  const deduped = songs.filter((song) => {
    if (seen.has(song.id)) {
      return false;
    }
    seen.add(song.id);
    return true;
  });
  prevResult.current = deduped;
  return deduped;
};

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
