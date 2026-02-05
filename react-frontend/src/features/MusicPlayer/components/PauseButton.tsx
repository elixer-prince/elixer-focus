import { useMusicPlayerContext } from "@features/MusicPlayer/stores/MusicPlayerContext.tsx";
import { pauseVideo } from "@features/MusicPlayer/utils/playback.ts";
import { FaPause } from "react-icons/fa";

const PauseButton = () => {
    const { playerInstanceRef, setPlaybackPaused } = useMusicPlayerContext();

    return (
        <button
            className={
                "flex aspect-square cursor-pointer items-center justify-center rounded-full p-2"
            }
            onClick={() => {
                pauseVideo(playerInstanceRef.current);
                setPlaybackPaused(false);
            }}
        >
            <FaPause size={16} />
        </button>
    );
};

export default PauseButton;
