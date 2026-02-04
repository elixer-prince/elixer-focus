import { useMusicPlayerContext } from "@features/MusicPlayer/stores/MusicPlayerContext.tsx";
import { FaPlay } from "react-icons/fa6";
import { playerButtonStyles } from "@features/MusicPlayer/components/styles.ts";
import { playVideo } from "@features/MusicPlayer/utils/playback.ts";

const PlayButton = () => {
    const { playerInstanceRef, setPlaybackPaused } = useMusicPlayerContext();

    return (
        <div
            className={playerButtonStyles}
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
