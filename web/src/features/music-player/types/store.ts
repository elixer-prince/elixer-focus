import type { Song } from "@/features/music-player/types/song";

export type MusicPlayerState = {
  chosenSongId: string;
  musicPaused?: boolean;
  showVolumeSlider?: boolean;
  songs: Song[];
  volume: number;
};

export type MusicPlayerActions = {
  setChosenSongId: (id: string) => void;
  setMusicPaused: (paused: boolean) => void;
  setShowVolumeSlider: (show: boolean) => void;
  setSongs: (songs: Song[]) => void;
  setVolume: (volume: number) => void;
  addSong: (url: string, title?: string) => void;
  removeSong: (id: string) => void;
};

export type MusicPlayerStore = MusicPlayerState & MusicPlayerActions;
