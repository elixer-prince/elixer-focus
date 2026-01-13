import { getFromLocalStorage } from "@utils/storage.ts";
import {
    createContext,
    useContext,
    useMemo,
    useRef,
    useState,
    type Dispatch,
    type PropsWithChildren,
    type RefObject,
    type SetStateAction,
} from "react";

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
        title: "90s Chill Lofi Playlist",
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

type SongType = {
    id: number;
    title: string;
    src: string;
    isRecommended: boolean;
};

type MusicPlayerContextType = {
    chosenSongIndex: number;
    playbackPaused: boolean;
    songs: SongType[];

    playerRef: RefObject<HTMLDivElement | null>;

    setChosenSongIndex: (value: number) => void;
    setPlaybackPaused: (value: boolean) => void;
    setSongs: Dispatch<SetStateAction<SongType[]>>;
};

const MusicPlayerContext = createContext<MusicPlayerContextType | null>(null);

export const MusicPlayerProvider = ({ children }: PropsWithChildren) => {
    const [chosenSongIndex, setChosenSongIndex] = useState(
        getFromLocalStorage("chosenSongIndex") || 0,
    );
    const [playbackPaused, setPlaybackPaused] = useState(
        getFromLocalStorage("playbackPaused") && false,
    );
    const [songs, setSongs] = useState<SongType[]>(defaultSongs);

    const playerRef = useRef<HTMLDivElement | null>(null);

    // useEffect(() => {
    //     if (player) {
    //         const videoId = extractVideoId(playlist[value].src);
    //         player.loadVideoById(videoId);
    //     }

    //     if (youtubeAPIAlreadyLoaded()) return createPlayer();

    //     window._createPlayerAfterAPI();
    // }, []);

    const contextValue: MusicPlayerContextType = useMemo(
        () => ({
            chosenSongIndex,
            playbackPaused,
            songs,
            playerRef,
            setChosenSongIndex,
            setPlaybackPaused,
            setSongs,
        }),
        [
            chosenSongIndex,
            playbackPaused,
            songs,
            setChosenSongIndex,
            setPlaybackPaused,
            setSongs,
        ],
    );

    return (
        <MusicPlayerContext.Provider value={contextValue}>
            {children}
        </MusicPlayerContext.Provider>
    );
};

export const useMusicPlayerContext = () => {
    const musicPlayerContext = useContext(MusicPlayerContext);

    if (!musicPlayerContext) {
        throw new Error(
            "useMusicPlayerContext must be used within a MusicPlayerProvider",
        );
    }

    return musicPlayerContext;
};
