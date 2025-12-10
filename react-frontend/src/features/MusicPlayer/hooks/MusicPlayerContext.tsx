import { getFromLocalStorage } from "@utils/storage.ts";
import {
    createContext,
    useEffect,
    useMemo,
    useRef,
    useState,
    type Dispatch,
    type ReactNode,
    type SetStateAction,
} from "react";

interface MusicPlayerContextProps {
    children: ReactNode;
}

type MusicPlayerContextType = {
    player: unknown;
    playerRef: React.RefObject<HTMLDivElement>;
    chosenSongIndex: number;
    setChosenSongIndex: Dispatch<SetStateAction<number>>;
    playbackPaused: boolean;
    setPlaybackPaused: Dispatch<SetStateAction<boolean>>;
    songs: {
        id: number;
        title: string;
        src: string;
        isRecommended: boolean;
    }[];
    setSongs: Dispatch<
        SetStateAction<
            {
                id: number;
                title: string;
                src: string;
                isRecommended: boolean;
            }[]
        >
    >;
};

const MusicPlayerContext = createContext<MusicPlayerContextType | null>(null);

const MusicPlayerProvider = ({ children }: MusicPlayerContextProps) => {
    let player;

    const [chosenSongIndex, setChosenSongIndex] = useState(() => {
        return getFromLocalStorage("chosenSongIndex") || 0;
    });
    const [playbackPaused, setPlaybackPaused] = useState(() => {
        return getFromLocalStorage("playbackPaused") && false;
    });
    const playerRef = useRef<HTMLDivElement>(null);
    const [songs, setSongs] = useState([
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
    ]);

    useEffect(() => {
        if (player) {
            const videoId = extractVideoId(playlist[value].src);
            player.loadVideoById(videoId);
        }

        if (youtubeAPIAlreadyLoaded()) return createPlayer();

        window._createPlayerAfterAPI();
    }, []);

    const contextValue: MusicPlayerContextType = useMemo(
        () => ({
            chosenSongIndex,
            setChosenSongIndex,
            player,
            playerRef,
            playbackPaused,
            setPlaybackPaused,
            songs,
            setSongs,
        }),
        [
            chosenSongIndex,
            setChosenSongIndex,
            player,
            playerRef,
            playbackPaused,
            setPlaybackPaused,
            songs,
            setSongs,
        ],
    );

    return (
        <MusicPlayerContext.Provider value={contextValue}>
            {children}
        </MusicPlayerContext.Provider>
    );
};

export { MusicPlayerContext, MusicPlayerProvider };
