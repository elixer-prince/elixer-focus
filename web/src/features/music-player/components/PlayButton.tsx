import useMusicPlayerContext from "@/features/music-player/hooks/useMusicPlayerContext";
import { playVideo } from "@/features/music-player/utils/playback";
import { useSetPlaybackPaused } from "@/features/music-player/stores/store";
import { FaPlay } from "react-icons/fa6";

const PlayButton = () => {
  const setMusicPaused = useSetPlaybackPaused();
  const { playerInstanceRef } = useMusicPlayerContext();

  return (
    <button
      className="play-button flex aspect-square cursor-pointer items-center justify-center rounded-full p-2"
      onClick={() => {
        playVideo(playerInstanceRef);
        setMusicPaused(false);
      }}
    >
      <FaPlay size={16} />
    </button>
  );
};

export default PlayButton;
