import useMusicPlayerContext from "@/features/music-player/hooks/useMusicPlayerContext";
import { pauseVideo } from "@/features/music-player/utils/playback";
import { useSetPlaybackPaused } from "@/stores/music-player";
import { FaPause } from "react-icons/fa";

const PauseButton = () => {
  const setMusicPaused = useSetPlaybackPaused();
  const { playerInstanceRef } = useMusicPlayerContext();

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
