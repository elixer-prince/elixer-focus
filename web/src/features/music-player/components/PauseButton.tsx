import useMusicPlayerContext from "@/features/music-player/hooks/useMusicPlayerContext";
import { useSetMusicPaused } from "@/features/music-player/stores/store";
import { pauseVideo } from "@/features/music-player/utils/playback";
import { FaPause } from "react-icons/fa";

const PauseButton = () => {
  const setMusicPaused = useSetMusicPaused();
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
