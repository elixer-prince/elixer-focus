import { pauseVideo } from "@/features/music-player/utils/playback";
import { useSetPlaybackPaused } from "@/stores/music-player";
import type { YTPlayerRef } from "@/types/music-player/player";
import { FaPause } from "react-icons/fa";

interface PauseButtonProps {
  playerInstanceRef: YTPlayerRef;
}

const PauseButton = ({ playerInstanceRef }: PauseButtonProps) => {
  const setMusicPaused = useSetPlaybackPaused();

  return (
    <button
      className="pause-button flex aspect-square cursor-pointer items-center justify-center rounded-full p-2"
      onClick={() => {
        pauseVideo(playerInstanceRef);
        setMusicPaused(true);
      }}
    >
      <FaPause size={16} />
    </button>
  );
};

export default PauseButton;
