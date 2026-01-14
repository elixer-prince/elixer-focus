import { useMusicPlayerContext } from "@features/MusicPlayer/stores/MusicPlayerContext";
import { pauseVideo } from "@features/MusicPlayer/utils/controls";
import { FaPause } from "react-icons/fa";

const PlayButton = () => {
    const { playerInstanceRef, setPlaybackPaused } = useMusicPlayerContext();

    return (
        <div
            className={
                "flex aspect-square cursor-pointer items-center justify-center rounded-full p-2"
            }
            onClick={() => {
                pauseVideo(playerInstanceRef.current);
                setPlaybackPaused(false);
            }}
        >
            <FaPause size={16} />
        </div>
    );
};

export default PlayButton;
