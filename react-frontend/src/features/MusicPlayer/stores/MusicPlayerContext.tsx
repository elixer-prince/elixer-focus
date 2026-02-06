import type {
    MusicPlayerContextType,
    SongType,
} from "@/features/MusicPlayer/types";
import { getVideoId } from "@/features/MusicPlayer/utils/conversion";
import { getFromLocalStorage } from "@/utils/storage.ts";
import {
    createContext,
    type PropsWithChildren,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
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

const MusicPlayerContext = createContext<MusicPlayerContextType | null>(null);

export const MusicPlayerProvider = ({ children }: PropsWithChildren) => {
    const [chosenSongId, setChosenSongId] = useState(
        getFromLocalStorage("chosenSongId") ?? defaultSongs[0].id,
    );
    const [playbackPaused, setPlaybackPaused] = useState(
        getFromLocalStorage("playbackPaused") && true,
    );
    const [songs, setSongs] = useState<SongType[]>(defaultSongs);
    const [volume, setVolume] = useState(50);
    const [showSlider, setShowSlider] = useState(false);

    const playerRef = useRef<HTMLDivElement | null>(null);
    const playerInstanceRef = useRef<any>(null);

    useEffect(() => {
        const tag = document.createElement("script");
        tag.src = "https://www.youtube.com/iframe_api";
        document.body.appendChild(tag);

        window.onYouTubeIframeAPIReady = () => {
            if (playerRef.current) {
                playerInstanceRef.current = new window.YT.Player(
                    playerRef.current,
                    {
                        videoId: getVideoId(songs[chosenSongId].src),
                        playerVars: { autoplay: 0, playsinline: 1 },
                        // events: {
                        //     onReady: (event: any) =>
                        //         onPlayerReady(event, playbackPaused),
                        //     onStateChange: onPlayerStateChange,
                        // },
                    },
                );
            }
        };
    }, []);

    useEffect(() => {
        if (playerInstanceRef.current) {
            const song = songs.find((s) => s.id === chosenSongId);
            if (song) {
                playerInstanceRef.current.loadVideoById(getVideoId(song.src));
            }
        }
    }, [chosenSongId, songs]);

    const contextValue: MusicPlayerContextType = useMemo(
        () => ({
            chosenSongId,
            playbackPaused,
            songs,
            volume,
            showSlider,
            playerRef,
            playerInstanceRef,
            setChosenSongId,
            setPlaybackPaused,
            setSongs,
            setVolume,
            setShowSlider,
        }),
        [
            chosenSongId,
            playbackPaused,
            songs,
            volume,
            showSlider,
            setChosenSongId,
            setPlaybackPaused,
            setSongs,
            setVolume,
            setShowSlider,
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
