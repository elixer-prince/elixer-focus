import { useMusicPlayerContext } from "@features/MusicPlayer/stores/MusicPlayerContext.tsx";
import { pauseVideo } from "@features/MusicPlayer/utils/controls.ts";
import { FaPause } from "react-icons/fa";
import { playerButtonStyles } from "@features/MusicPlayer/components/styles.ts";

const PauseButton = () => {
    const { playerInstanceRef, setPlaybackPaused } = useMusicPlayerContext();

    return (
        <button
            className={playerButtonStyles}
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
