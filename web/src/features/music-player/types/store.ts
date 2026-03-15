import type { Song } from "@/features/music-player/types/song";

export type MusicPlayerState = {
  chosenSongId: number;
  musicPaused: boolean;
  showVolumeSlider: boolean;
  songs: Song[];
  volume: number;
};

export type MusicPlayerActions = {
  setChosenSongId: (id: number) => void;
  setMusicPaused: (paused: boolean) => void;
  setShowVolumeSlider: (show: boolean) => void;
  setSongs: (songs: Song[]) => void;
  setVolume: (volume: number) => void;
};

export type MusicPlayerStore = MusicPlayerState & MusicPlayerActions;
