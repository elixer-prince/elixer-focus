import { useMusicPlayerContext } from "@/features/MusicPlayer/stores/MusicPlayerContext.tsx";
import { playVideo } from "@/features/MusicPlayer/utils/playback.ts";
import { FaPlay } from "react-icons/fa6";

const PlayButton = () => {
    const { playerInstanceRef, setPlaybackPaused } = useMusicPlayerContext();

    return (
        <div
            className={
                "flex aspect-square cursor-pointer items-center justify-center rounded-full p-2"
            }
            onClick={() => {
                playVideo(playerInstanceRef.current);
                setPlaybackPaused(true);
            }}
        >
            <FaPlay size={16} />
        </div>
    );
};

export default PlayButton;
