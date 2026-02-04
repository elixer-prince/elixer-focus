import type { Dispatch, RefObject, SetStateAction } from "react";

export type SongType = {
    id: number;
    title: string;
    src: string;
    isRecommended: boolean;
};

export type MusicPlayerContextType = {
    chosenSongId: number;
    setChosenSongId: (value: number) => void;
    playbackPaused: boolean;
    setPlaybackPaused: (value: boolean) => void;
    songs: SongType[];
    setSongs: Dispatch<SetStateAction<SongType[]>>;
    volume: number;
    setVolume: (value: number) => void;
    showSlider: boolean;
    setShowSlider: (value: boolean) => void;

    playerRef: RefObject<HTMLDivElement | null>;
    playerInstanceRef: RefObject<any>;
};
