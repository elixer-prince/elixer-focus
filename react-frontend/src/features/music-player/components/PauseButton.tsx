import { useSetPlaybackPaused } from "@/stores/music-player.ts";
import { pauseVideo } from "@/features/music-player/utils/playback";
import { FaPause } from "react-icons/fa";

const PauseButton = ({ playerInstanceRef }: { playerInstanceRef: any }) => {
  const setPlaybackPaused = useSetPlaybackPaused();

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
